import React, { useRef, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BridgePlanViewProps {
    span: number;
    width: number;
    skewAngle: number;
    girderCount: number;
    girderSpacing: number;
}

const BridgePlanView: React.FC<BridgePlanViewProps> = ({
    span,
    width,
    skewAngle,
    girderCount,
    girderSpacing,
}) => {
    const { language } = useApp();
    const t = useTranslation(language);
    const containerRef = useRef<HTMLDivElement>(null);

    // Defaults
    const appliedSpan = span || 30.0;
    const appliedWidth = width || 12.0;
    const appliedSkew = skewAngle || 0;
    const appliedGirderCount = girderCount || 4;

    // --- SVG Scaling ---
    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 350;
    const PADDING = 40;

    // Calculate drawing scale to fit the longest dimension (Span or Width) into the viewport
    // We add buffer for skew offset
    const maxSpanDisplay = Math.max(appliedSpan, appliedWidth * 2);
    const scale = (SVG_WIDTH - (PADDING * 2)) / maxSpanDisplay;

    // Scaled dimensions
    const scaledSpan = appliedSpan * scale;
    const scaledWidth = appliedWidth * scale;

    // Skew calculation: tan(angle) * width = horizontal offset
    // We convert angle to radians
    const skewRad = (appliedSkew * Math.PI) / 180;
    const skewOffset = Math.tan(skewRad) * scaledWidth;

    // Center the drawing
    const startX = (SVG_WIDTH - scaledSpan) / 2;
    const startY = (SVG_HEIGHT - scaledWidth) / 2;

    const initiateExport = async () => {
        if (!containerRef.current) return;
        try {
            const canvas = await html2canvas(containerRef.current, {
                backgroundColor: '#ffffff',
                scale: 3,
                logging: false,
                onclone: (clonedDoc) => {
                    const svgElement = clonedDoc.querySelector('svg');
                    if (svgElement) svgElement.style.color = '#000000';
                    const root = clonedDoc.documentElement;
                    root.style.setProperty('--foreground', '0 0% 0%');
                    root.style.setProperty('--muted', '0 0% 90%');
                    root.style.setProperty('--muted-foreground', '0 0% 30%');
                }
            });
            const link = document.createElement('a');
            link.download = `Osdag-Plan-View-${new Date().toISOString()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success("Plan View Exported!");
        } catch (err) {
            toast.error("Export failed");
        }
    };

    // Animation configuration
    const springConfig = { type: "spring", stiffness: 280, damping: 24 } as const;

    return (
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden h-full flex flex-col relative w-full">
            {/* Component Header */}
            <div className="bg-primary/5 text-primary-foreground px-4 py-2 font-semibold text-sm flex justify-between items-center z-10 border-b border-border/10">
                <span className="text-foreground">{t('planView') || "Plan View Configuration"}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={initiateExport}
                    className="h-7 px-2 hover:bg-primary/10 transition-all text-foreground"
                    title="Save Plan View"
                >
                    <Download className="h-4 w-4 mr-1" />
                    <span className="text-xs">Export</span>
                </Button>
            </div>

            <div ref={containerRef} className="flex-1 p-4 flex items-center justify-center bg-background relative w-full h-full">
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full max-h-[400px]">
                    <defs>
                        <marker id="arrowPlan" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                            <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--foreground))" />
                        </marker>
                    </defs>

                    {/* 1. Bridge Deck Outline (Polygon for Skew) */}
                    <motion.polygon
                        layout
                        animate={{
                            points: `
                ${startX + skewOffset},${startY} 
                ${startX + scaledSpan + skewOffset},${startY} 
                ${startX + scaledSpan},${startY + scaledWidth} 
                ${startX},${startY + scaledWidth}
              `
                        }}
                        transition={springConfig}
                        fill="hsl(var(--muted))"
                        stroke="hsl(var(--foreground))"
                        strokeWidth="2"
                        opacity="0.2"
                    />

                    {/* 2. Abutment Lines (Thick lines at ends) */}
                    <motion.line
                        animate={{ x1: startX + skewOffset, y1: startY, x2: startX, y2: startY + scaledWidth }}
                        transition={springConfig}
                        stroke="hsl(var(--foreground))"
                        strokeWidth="4"
                    />
                    <motion.line
                        animate={{ x1: startX + scaledSpan + skewOffset, y1: startY, x2: startX + scaledSpan, y2: startY + scaledWidth }}
                        transition={springConfig}
                        stroke="hsl(var(--foreground))"
                        strokeWidth="4"
                    />

                    {/* 3. Centerline */}
                    <motion.line
                        animate={{
                            x1: startX + (skewOffset / 2) - 20,
                            y1: startY + (scaledWidth / 2),
                            x2: startX + scaledSpan + (skewOffset / 2) + 20,
                            y2: startY + (scaledWidth / 2)
                        }}
                        transition={springConfig}
                        stroke="hsl(var(--chart-1))" // Distinct color for CL
                        strokeWidth="1"
                        strokeDasharray="10,5"
                    />
                    <text x={startX + scaledSpan + (skewOffset / 2) + 30} y={startY + (scaledWidth / 2) + 3} fontSize="10" fill="hsl(var(--chart-1))">CL</text>


                    {/* 4. Skew Angle Annotation */}
                    {/* Draw a helper vertical line to show angle */}
                    <motion.line
                        animate={{ x1: startX, y1: startY + scaledWidth, x2: startX, y2: startY + scaledWidth - 40 }}
                        transition={springConfig}
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="2,2"
                    />
                    {/* Draw the arc approximation or just text if small */}
                    <text x={startX - 10} y={startY + scaledWidth - 10} textAnchor="end" fontSize="10" fill="hsl(var(--foreground))">
                        Skew: {appliedSkew}°
                    </text>

                    {/* 5. Span Dimension */}
                    <motion.line
                        animate={{ x1: startX, y1: startY + scaledWidth + 20, x2: startX + scaledSpan, y2: startY + scaledWidth + 20 }}
                        transition={springConfig}
                        stroke="hsl(var(--foreground))"
                        markerEnd="url(#arrowPlan)"
                        markerStart="url(#arrowPlan)"
                    />
                    <text x={startX + scaledSpan / 2} y={startY + scaledWidth + 35} textAnchor="middle" fontSize="11" fontWeight="bold" fill="hsl(var(--foreground))">
                        Span: {appliedSpan}m
                    </text>

                </svg>
            </div>
        </div>
    );
};

export default BridgePlanView;
