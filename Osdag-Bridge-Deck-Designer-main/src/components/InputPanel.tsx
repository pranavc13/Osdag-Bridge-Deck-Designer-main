import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { LocationData } from '@/lib/locationData';
import TypeOfStructure from './TypeOfStructure';
import ProjectLocation from './ProjectLocation';
import GeometricDetails from './GeometricDetails';
import MaterialInputs from './MaterialInputs';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Interface defining the state props required for the bridge configuration
// These values flow down to the specific input sub-components
interface InputPanelProps {
  // Primary dimensioning parameters (Span, Width, Skew)
  geometricValues: {
    span: string;
    carriageWay: string;
    footpath: string;
    skewAngle: string;
  };
  onGeometricChange: (field: string, value: string) => void;

  // Secondary structural configurations (Girders, Overhangs)
  additionalGeometry: {
    girderSpacing: string;
    noOfGirders: string;
    deckOverhang: string;
  };
  onAdditionalGeometryChange: (values: { girderSpacing: string; noOfGirders: string; deckOverhang: string }) => void;

  // Callback to reset all inputs to standard default values
  onReset: () => void;
}

/**
 * InputPanel Component
 * 
 * The main control center for the Bridge Deck Designer.
 * It organizes the complex set of engineering inputs into logical tabs:
 * 1. Basic Inputs: Core geometry, location, and structural type.
 * 2. Additional Inputs: Advanced configurations.
 * 
 * Manages local UI state (like tab selection) while delegating 
 * value updates to the parent controller.
 */
const InputPanel: React.FC<InputPanelProps> = ({
  geometricValues,
  onGeometricChange,
  additionalGeometry,
  onAdditionalGeometryChange,
  onReset,
}) => {
  const { language } = useApp();
  const t = useTranslation(language);

  // Local state for non-geometric metadata handling
  // These might be moved to global state if they need to persist across sessions
  const [structureType, setStructureType] = useState('highway');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [materialValues, setMaterialValues] = useState({
    girder: '',
    crossBracing: '',
    deck: '',
  });

  // Example Logic: Disable certain inputs if "Other" structure type is selected
  // This mimics real-world software behavior where unrelated options are locked out
  const isCustomStructure = structureType === 'other';

  // Handler for material grade updates
  const handleMaterialGradeUpdate = (field: string, grade: string) => {
    setMaterialValues((previousGrades) => ({ ...previousGrades, [field]: grade }));
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden h-full flex flex-col">
      {/* Tabbed Interface for Categorized Inputs */}
      <Tabs defaultValue="basic" className="flex-1 flex flex-col">

        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted pr-2">
          <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-none">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-tab-active data-[state=active]:text-primary-foreground rounded-none rounded-tl-lg px-6 py-2.5 text-sm font-medium transition-all"
            >
              {t('basicInputs')}
            </TabsTrigger>
            <TabsTrigger
              value="additional"
              className="data-[state=active]:bg-tab-active data-[state=active]:text-primary-foreground rounded-none px-6 py-2.5 text-sm font-medium transition-all"
            >
              {t('additionalInputs')}
            </TabsTrigger>
          </TabsList>

          {/* Quick Action: Reset to Defaults */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-all rounded-full"
            title="Reset All Parameters to Defaults"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset</span>
          </Button>
        </div>

        {/* Tab 1: Primary Design Inputs */}
        <TabsContent value="basic" className="flex-1 overflow-y-auto scrollbar-thin m-0 p-4 space-y-4">

          {/* Section 1: Structure Type Selection */}
          <TypeOfStructure value={structureType} onChange={setStructureType} />

          {/* Section 2: Project Location Context */}
          <ProjectLocation
            disabled={isCustomStructure}
            locationData={locationData}
            onLocationChange={setLocationData}
          />

          {/* Section 3: Core Geometric Parameters */}
          <GeometricDetails
            disabled={isCustomStructure}
            values={geometricValues}
            onChange={onGeometricChange}
            geometryValues={additionalGeometry}
            onGeometryChange={onAdditionalGeometryChange}
          />

          {/* Section 4: Material Properties */}
          <MaterialInputs
            disabled={isCustomStructure}
            values={materialValues}
            onChange={handleMaterialGradeUpdate}
          />
        </TabsContent>

        {/* Tab 2: Advanced/Additional Inputs */}
        <TabsContent value="additional" className="flex-1 overflow-y-auto scrollbar-thin m-0 p-4">
          <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/20 rounded border border-dashed border-muted-foreground/20 m-2">
            <div className="text-center p-6">
              <p className="font-semibold mb-1">{t('additionalInputs')}</p>
              <span className="text-xs opacity-70">
                (Advanced parameters for secondary members will be configured here)
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InputPanel;
