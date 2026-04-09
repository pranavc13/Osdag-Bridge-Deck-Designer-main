import React, { useRef, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Define the properties expected by the Bridge Cross Section component
// 'carriageWayWidth': The clear width of the roadway in meters
// 'footpathType': Configuration of pedestrian pathways (none, singlesided, both)
// 'girderSpacing': Center-to-center distance between longitudinal girders
// 'numberOfGirders': Total count of main longitudinal girders
// 'deckOverhang': Distance from the outer girder center to the deck edge
interface BridgeCrossSectionProps {
  carriageWayWidth: number;
  footpathType: string;
  girderSpacing: number;
  numberOfGirders: number;
  deckOverhang: number;
  span: number;
  skewAngle: number;
}

/**
 * BridgeCrossSection Component
 * 
 * Visualization module for the steel-concrete composite deck.
 * Responsible for rendering the cross-sectional geometry based on 
 * IRC/Design standards inputs.
 * 
 * Features:
 * - Geometric validation and rendering
 * - Framer-motion driven transitions
 * - PNG Export generation
 */
const BridgeCrossSection: React.FC<BridgeCrossSectionProps> = ({
  carriageWayWidth,
  footpathType,
  girderSpacing,
  numberOfGirders,
  deckOverhang,
  span,
  skewAngle,
}) => {
  const { language, units } = useApp();
  const t = useTranslation(language);
  // Reference to the main container for image export functionality
  const diagramContainerRef = useRef<HTMLDivElement>(null);

  // Helper to format length based on selected units
  const formatLength = (meters: number) => {
    if (units === 'imperial') {
      const feet = meters * 3.28084;
      return `${feet.toFixed(2)}ft`;
    }
    return `${meters.toFixed(2)}m`;
  };

  // --- Geometric Calculations ---

  // Default fallback values to ensure the diagram always renders valid geometry
  const appliedCarriageWay = carriageWayWidth || 12.0;
  const appliedGirderCount = numberOfGirders || 4;
  const appliedOverhang = deckOverhang || 1.5;
  const appliedSpacing = girderSpacing || 3.0;
  // Default span and skew for display if missing
  const appliedSpan = span || 30.0;
  const appliedSkew = skewAngle || 0;

  // Determine footpath configuration
  // 'showLeft' assumes upstream or left side relative to flow
  const includesLeftFootpath = footpathType === 'single-sided' || footpathType === 'singlesided' || footpathType === 'both';
  const includesRightFootpath = footpathType === 'both';

  const FOOTPATH_WIDTH_METERS = 2.5; // Standard footpath width assumption

  // Calculate total deck width for scaling purposes
  const computedTotalWidth = useMemo(() => {
    let width = appliedCarriageWay;
    if (includesLeftFootpath) width += FOOTPATH_WIDTH_METERS;
    if (includesRightFootpath) width += FOOTPATH_WIDTH_METERS;
    return width;
  }, [appliedCarriageWay, includesLeftFootpath, includesRightFootpath]);

  // --- SVG Layout Constants ---
  const SVG_VIEWPORT_WIDTH = 480;
  const LAYOUT_PADDING_X = 30;
  const USABLE_DRAWING_WIDTH = SVG_VIEWPORT_WIDTH - (LAYOUT_PADDING_X * 2);

  // Dynamic scaling factor (Pixels per Meter)
  // Ensures the bridge always fits within the viewbox, with a minimum reference width of 15m
  const scalePixelsPerMeter = USABLE_DRAWING_WIDTH / Math.max(computedTotalWidth, 15);

  // --- Element Dimensions (Scaled) ---
  const scaledLeftFootpath = includesLeftFootpath ? FOOTPATH_WIDTH_METERS * scalePixelsPerMeter : 0;
  const scaledRightFootpath = includesRightFootpath ? FOOTPATH_WIDTH_METERS * scalePixelsPerMeter : 0;
  const scaledCarriageWay = appliedCarriageWay * scalePixelsPerMeter;
  const scaledOverhang = appliedOverhang * scalePixelsPerMeter;

  // Vertical Layout Anchors
  const ANCHOR_X = LAYOUT_PADDING_X;
  const ANCHOR_Y_DECK_TOP = 80;
  const DECK_THICKNESS_PX = 15;
  const KERB_HEIGHT_PX = 20;

  // --- Dynamic Girder Sizing ---
  // Approximate Rule of Thumb: Depth = Span / 20
  // Minimum depth of 1.0m to ensure visibility even for small spans
  const calculatedGirderDepthMeters = Math.max(appliedSpan / 20, 1.0);
  const girderDepthPx = calculatedGirderDepthMeters * scalePixelsPerMeter;
  const flangeWidthPx = 10 * (scalePixelsPerMeter / 30); // Approximate flange width scaling

  // Re-calculate vertical position anchors based on new depth
  // We keep the deck top fixed, and grow downwards
  const webHeightPx = girderDepthPx;

  // --- Girder Layout Logic ---
  // Calculates the horizontal center positions for each I-Girder
  const girderPositions = useMemo(() => {
    const positions: number[] = [];
    if (appliedGirderCount <= 0) return positions;

    // The first girder is positioned after the left overhang
    const firstGirderOffset = ANCHOR_X + scaledOverhang;
    const spacingPx = appliedSpacing * scalePixelsPerMeter;

    for (let i = 0; i < appliedGirderCount; i++) {
      const currentGirderX = firstGirderOffset + (i * spacingPx);
      positions.push(currentGirderX);
    }
    return positions;
  }, [appliedGirderCount, appliedSpacing, scalePixelsPerMeter, scaledOverhang]);


  // --- Event Handlers ---

  const initiateExport = async () => {
    if (!diagramContainerRef.current) return;

    try {
      console.log('Initiating diagram export...');
      const canvas = await html2canvas(diagramContainerRef.current, {
        backgroundColor: '#ffffff', // Output image will always have white background
        scale: 3, // High resolution
        logging: false,
        onclone: (clonedDoc) => {
          // Find the SVG in the cloned document
          const svgElement = clonedDoc.querySelector('svg');
          const container = clonedDoc.querySelector('.bg-card'); // Or the specific container class

          if (svgElement) {
            // Force lines and text to be black for the technical drawing export
            // regardless of what the user sees on screen (Dark/Light mode)
            svgElement.style.color = '#000000';

            // Set specific CSS variables for the clone scope if needed, 
            // or just rely on the fact that we modify fill/stroke attributes if they were direct colors.
            // Since we use CSS variables (var(--foreground)), we can override them on the root of the clone.
            const root = clonedDoc.documentElement;
            root.style.setProperty('--foreground', '0 0% 0%'); // Black
            root.style.setProperty('--muted', '0 0% 90%'); // Very light gray for fills
            root.style.setProperty('--muted-foreground', '0 0% 30%'); // Dark gray
            root.style.setProperty('--secondary', '0 0% 80%'); // Light gray for footpaths
          }
        }
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Osdag-Bridge-Section-${timestamp}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success(`Exported: ${filename}`);
    } catch (err) {
      console.error('Export Error:', err);
      toast.error('Could not generate image. Please try again.');
    }
  };

  // Animation configuration for smooth structural updates
  const springConfig = { type: "spring", stiffness: 280, damping: 24 } as const;

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden h-full flex flex-col relative">
      {/* Component Header with Actions */}
      <div className="bg-success text-success-foreground px-4 py-2 font-semibold text-sm flex justify-between items-center z-10 border-b border-success/20">
        <span>{t('bridgeCrossSection')}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={initiateExport}
          className="h-7 px-2 text-primary-foreground hover:bg-success-foreground/20 hover:text-white transition-all"
          title="Save Diagram as PNG"
        >
          <Download className="h-4 w-4 mr-1" />
          <span className="text-xs">Export</span>
        </Button>
      </div>

      {/* Main Drawing Area */}
      {/* bg-background ensures it uses the theme color (dark in dark mode, light in light mode) */}
      <div ref={diagramContainerRef} className="flex-1 p-4 flex items-center justify-center bg-background relative">
        <svg
          viewBox="0 0 500 320"
          className="w-full h-full max-h-80 select-none"
          style={{ maxWidth: '100%' }}
        >
          {/* Defs for arrow markers used in dimension lines */}
          <defs>
            <marker id="markerArrowEnd" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--foreground))" />
            </marker>
            <marker id="markerArrowStart" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
              <path d="M6,0 L0,3 L6,6 Z" fill="hsl(var(--foreground))" />
            </marker>
          </defs>

          {/* 1. Concrete Deck Slab */}
          <motion.rect
            layout
            initial={false}
            animate={{ width: USABLE_DRAWING_WIDTH }}
            transition={springConfig}
            x={ANCHOR_X}
            y={ANCHOR_Y_DECK_TOP}
            height={DECK_THICKNESS_PX}
            fill="hsl(var(--muted))"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            className="cursor-crosshair"
          />

          {/* 2. Left Footpath (Conditional) */}
          {includesLeftFootpath && (
            <g id="left-footpath-group">
              <motion.rect
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: scaledLeftFootpath }}
                exit={{ opacity: 0, width: 0 }}
                transition={springConfig}
                x={ANCHOR_X}
                y={ANCHOR_Y_DECK_TOP - KERB_HEIGHT_PX}
                height={KERB_HEIGHT_PX}
                fill="hsl(var(--secondary))"
                stroke="hsl(var(--foreground))"
                strokeWidth="1"
              />
              <motion.text
                layout
                animate={{ x: ANCHOR_X + scaledLeftFootpath / 2 }}
                transition={springConfig}
                y={ANCHOR_Y_DECK_TOP - KERB_HEIGHT_PX - 5}
                textAnchor="middle"
                fontSize="9"
                fill="hsl(var(--foreground))"
                fontWeight="500"
              >
                Footpath
              </motion.text>
            </g>
          )}

          {/* 3. Carriageway / Road Surface */}
          <motion.rect
            layout
            animate={{ x: ANCHOR_X + scaledLeftFootpath, width: scaledCarriageWay }}
            transition={springConfig}
            y={ANCHOR_Y_DECK_TOP - KERB_HEIGHT_PX}
            height={KERB_HEIGHT_PX}
            fill="hsl(var(--muted))"
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            opacity={0.8}
          />

          {/* Dimension Line: Carriageway */}
          <motion.line
            layout
            animate={{
              x1: ANCHOR_X + scaledLeftFootpath,
              x2: ANCHOR_X + scaledLeftFootpath + scaledCarriageWay
            }}
            transition={springConfig}
            y1={ANCHOR_Y_DECK_TOP - KERB_HEIGHT_PX - 15}
            y2={ANCHOR_Y_DECK_TOP - KERB_HEIGHT_PX - 15}
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            markerEnd="url(#markerArrowEnd)"
            markerStart="url(#markerArrowStart)"
          />
          <motion.text
            layout
            animate={{ x: ANCHOR_X + scaledLeftFootpath + scaledCarriageWay / 2 }}
            transition={springConfig}
            y={ANCHOR_Y_DECK_TOP - KERB_HEIGHT_PX - 20}
            textAnchor="middle"
            fontSize="10"
            fill="hsl(var(--foreground))"
            fontWeight="500"
          >
            Carriageway: {formatLength(appliedCarriageWay)}
          </motion.text>

          {/* 4. Right Footpath (Conditional) */}
          {includesRightFootpath && (
            <g id="right-footpath-group">
              <motion.rect
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, x: ANCHOR_X + scaledLeftFootpath + scaledCarriageWay, width: scaledRightFootpath }}
                exit={{ opacity: 0, width: 0 }}
                transition={springConfig}
                y={ANCHOR_Y_DECK_TOP - KERB_HEIGHT_PX}
                height={KERB_HEIGHT_PX}
                fill="hsl(var(--secondary))"
                stroke="hsl(var(--foreground))"
                strokeWidth="1"
              />
              <motion.text
                layout
                animate={{ x: ANCHOR_X + scaledLeftFootpath + scaledCarriageWay + scaledRightFootpath / 2 }}
                transition={springConfig}
                y={ANCHOR_Y_DECK_TOP - KERB_HEIGHT_PX - 5}
                textAnchor="middle"
                fontSize="9"
                fill="hsl(var(--foreground))"
                fontWeight="500"
              >
                Footpath
              </motion.text>
            </g>
          )}

          {/* 5. Left Cantilever / Overhang Dimension */}
          <motion.g layout transition={springConfig}>
            {/* Vertical drop lines */}
            <line x1={ANCHOR_X} y1={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX} x2={ANCHOR_X} y2={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 30} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4" />
            <motion.line animate={{ x1: ANCHOR_X + scaledOverhang, x2: ANCHOR_X + scaledOverhang }} transition={springConfig} y1={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX} y2={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 30} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4" />

            {/* Horizontal dimension line */}
            <motion.line animate={{ x2: ANCHOR_X + scaledOverhang }} transition={springConfig} x1={ANCHOR_X} y1={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 15} y2={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 15} stroke="hsl(var(--foreground))" strokeWidth="1" markerEnd="url(#markerArrowEnd)" markerStart="url(#markerArrowStart)" />

            <motion.text animate={{ x: ANCHOR_X + scaledOverhang / 2 }} transition={springConfig} y={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 45} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
              Overhang
            </motion.text>
            <motion.text animate={{ x: ANCHOR_X + scaledOverhang / 2 }} transition={springConfig} y={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 57} textAnchor="middle" fontSize="9" fontWeight="bold" fill="hsl(var(--muted-foreground))">
              {formatLength(appliedOverhang)}
            </motion.text>
          </motion.g>

          {/* 6. Steel Girders (I-Sections) */}
          <g id="steel-girders">
            {girderPositions.map((posX, index) => (
              <motion.g
                key={`girder-${index}`}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={springConfig}
              >
                {/* Top Flange */}
                <motion.rect
                  animate={{ x: posX - (flangeWidthPx / 2), width: flangeWidthPx }}
                  transition={springConfig}
                  y={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX}
                  height={5}
                  fill="hsl(var(--foreground))"
                />

                {/* Web */}
                <motion.rect
                  animate={{ x: posX - (flangeWidthPx / 6), width: flangeWidthPx / 3, height: webHeightPx }}
                  transition={springConfig}
                  y={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX}
                  fill="hsl(var(--foreground))"
                />

                {/* Bottom Flange */}
                <motion.rect
                  animate={{ x: posX - (flangeWidthPx / 2), y: ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + webHeightPx, width: flangeWidthPx }}
                  transition={springConfig}
                  height={8}
                  fill="hsl(var(--foreground))"
                />
              </motion.g>
            ))}
          </g>

          {/* 7. Cross Bracing Frames - Updated for Dynamic Depth */}
          <g id="cross-bracing" stroke="hsl(var(--foreground))" strokeWidth="1.5">
            {girderPositions.slice(0, -1).map((currentX, index) => {
              const nextGirderX = girderPositions[index + 1];
              if (nextGirderX) {
                // Bracing usually connects top 1/3 and bottom 1/3
                const bracingTopY = ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + (webHeightPx * 0.1);
                const bracingBottomY = ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + (webHeightPx * 0.9);

                return (
                  <motion.g key={`bracing-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={springConfig}>
                    {/* X-Bracing */}
                    <motion.line
                      animate={{ x1: currentX + 5, x2: nextGirderX - 5, y1: bracingTopY, y2: bracingBottomY }}
                      transition={springConfig}
                    />
                    <motion.line
                      animate={{ x1: nextGirderX - 5, x2: currentX + 5, y1: bracingTopY, y2: bracingBottomY }}
                      transition={springConfig}
                    />
                  </motion.g>
                );
              }
              return null;
            })}
          </g>

          {/* 8. Right Cantilever / Overhang Dimension */}
          <motion.g layout transition={springConfig}>
            <motion.line animate={{ x1: ANCHOR_X + USABLE_DRAWING_WIDTH - scaledOverhang, x2: ANCHOR_X + USABLE_DRAWING_WIDTH - scaledOverhang }} transition={springConfig} y1={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX} y2={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 30} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4" />
            <line x1={ANCHOR_X + USABLE_DRAWING_WIDTH} y1={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX} x2={ANCHOR_X + USABLE_DRAWING_WIDTH} y2={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 30} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4" />
            <motion.line animate={{ x1: ANCHOR_X + USABLE_DRAWING_WIDTH - scaledOverhang }} transition={springConfig} x2={ANCHOR_X + USABLE_DRAWING_WIDTH} y1={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 15} y2={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 15} stroke="hsl(var(--foreground))" strokeWidth="1" markerEnd="url(#markerArrowEnd)" markerStart="url(#markerArrowStart)" />

            <motion.text animate={{ x: ANCHOR_X + USABLE_DRAWING_WIDTH - scaledOverhang / 2 }} transition={springConfig} y={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 45} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
              Overhang
            </motion.text>
            <motion.text animate={{ x: ANCHOR_X + USABLE_DRAWING_WIDTH - scaledOverhang / 2 }} transition={springConfig} y={ANCHOR_Y_DECK_TOP + DECK_THICKNESS_PX + 57} textAnchor="middle" fontSize="9" fontWeight="bold" fill="hsl(var(--muted-foreground))">
              {formatLength(appliedOverhang)}
            </motion.text>
          </motion.g>

          {/* 9. General Labels */}
          <text x={250} y={220} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" className="uppercase tracking-wider">
            {appliedGirderCount} Steel Girders @ {formatLength(appliedSpacing)} c/c
          </text>

          <text x={250} y={250} textAnchor="middle" fontSize="12" fill="hsl(var(--foreground))" fontWeight="700">
            COMPOSITE BRIDGE CROSS-SECTION
          </text>

          <g fontSize="10" fill="hsl(var(--success))" fontWeight="500">
            <text x={250} y={270} textAnchor="middle">
              Total Deck Width: {formatLength(computedTotalWidth)}
            </text>
          </g>
        </svg>
      </div>

      {/* Footer: Live Parameters Grid */}
      <div className="p-3 bg-muted border-t border-border">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 rounded bg-background/50">
            <span className="text-muted-foreground block mb-1">Clear Width</span>
            <p className="font-mono text-success font-bold text-sm">{formatLength(appliedCarriageWay)}</p>
          </div>
          <div className="text-center p-2 rounded bg-background/50">
            <span className="text-muted-foreground block mb-1">Girders</span>
            <p className="font-mono text-success font-bold text-sm">{appliedGirderCount} Nos.</p>
          </div>
          <div className="text-center p-2 rounded bg-background/50">
            <span className="text-muted-foreground block mb-1">Girder Spacing</span>
            <p className="font-mono text-success font-bold text-sm">{formatLength(appliedSpacing)}</p>
          </div>
          <div className="text-center p-2 rounded bg-background/50">
            <span className="text-muted-foreground block mb-1">Span</span>
            <p className="font-mono text-success font-bold text-sm">{formatLength(appliedSpan)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BridgeCrossSection;
