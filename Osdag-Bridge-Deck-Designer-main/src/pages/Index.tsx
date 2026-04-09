import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import SettingsDialog from '@/components/SettingsDialog';
import InputPanel from '@/components/InputPanel';
import BridgeCrossSection from '@/components/BridgeCrossSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BridgePlanView from '@/components/BridgePlanView';
import { toast, Toaster } from 'sonner';

/**
 * DesignWorkspace Component
 * 
 * Central layout combining the parameter configuration panel and the
 * live bridge visualization. Manages the state for geometric inputs
 * and coordinates updates between components.
 */
const DesignWorkspace: React.FC = () => {
  // Global Settings Modal State
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  // --- Design Parameter State Management ---

  // Default Engineering Values (Based on IRC Class A Loading typical dimensions)
  const defaultPrimaryDimensions = {
    span: '',
    carriageWay: '12',   // Standard two-lane + shoulder
    footpath: 'both',    // Default to footpaths on both sides
    skewAngle: '',
  };

  const defaultSecondaryDimensions = {
    girderSpacing: '3',  // Typical spacing for composite decks
    noOfGirders: '4',    // Minimum for redundancy in many codes
    deckOverhang: '1.5', // Allowable cantilever
  };

  // Active State Hooks
  const [geometricValues, setGeometricValues] = useState(defaultPrimaryDimensions);
  const [additionalGeometry, setAdditionalGeometry] = useState(defaultSecondaryDimensions);

  // --- Handlers ---

  const handlePrimaryDimensionUpdate = (field: string, value: string) => {
    setGeometricValues((prevConfig) => ({ ...prevConfig, [field]: value }));
  };

  const resetAllParameters = () => {
    // Revert to the predefined engineering defaults
    setGeometricValues(defaultPrimaryDimensions);
    setAdditionalGeometry(defaultSecondaryDimensions);
  };

  const { autoSave } = useApp();

  // Mock Auto-Save Logic
  useEffect(() => {
    if (!autoSave) return;

    const timeoutId = setTimeout(() => {
      // Only show saved if we have some data
      if (geometricValues.carriageWay) {
        toast.success("Progress auto-saved", {
          description: "Your changes have been stored locally.",
          duration: 2000,
        });
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [geometricValues, additionalGeometry, autoSave]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onSettingsClick={() => setSettingsModalOpen(true)} />

      <main className="flex-1 p-4 lg:p-6">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6" style={{ minHeight: 'calc(100vh - 7rem)' }}>

          {/* Left Pane: Parameter Input & Configuration */}
          <div className="min-h-0">
            <InputPanel
              geometricValues={geometricValues}
              onGeometricChange={handlePrimaryDimensionUpdate}
              additionalGeometry={additionalGeometry}
              onAdditionalGeometryChange={setAdditionalGeometry}
              onReset={resetAllParameters}
            />
          </div>

          {/* Right Pane: Real-time Visualization */}
          <div className="min-h-0 h-full">
            <Tabs defaultValue="cross-section" className="h-full flex flex-col">
              <div className="flex justify-end px-4 mb-2">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="cross-section" className="text-xs">Cross Section</TabsTrigger>
                  <TabsTrigger value="plan-view" className="text-xs">Plan View</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="cross-section" className="flex-1 mt-0 h-full min-h-0">
                <BridgeCrossSection
                  // Map state values to component props with type coercion
                  carriageWayWidth={parseFloat(geometricValues.carriageWay) || 0}
                  footpathType={geometricValues.footpath}
                  girderSpacing={parseFloat(additionalGeometry.girderSpacing) || 0}
                  numberOfGirders={parseInt(additionalGeometry.noOfGirders) || 0}
                  deckOverhang={parseFloat(additionalGeometry.deckOverhang) || 0}
                  span={parseFloat(geometricValues.span) || 0}
                  skewAngle={parseFloat(geometricValues.skewAngle) || 0}
                />
              </TabsContent>

              <TabsContent value="plan-view" className="flex-1 mt-0 h-full min-h-0">
                <BridgePlanView
                  span={parseFloat(geometricValues.span) || 0}
                  width={parseFloat(geometricValues.carriageWay) + (geometricValues.footpath !== 'none' ? 2.5 : 0) + (geometricValues.footpath === 'both' ? 2.5 : 0) || 12}
                  skewAngle={parseFloat(geometricValues.skewAngle) || 0}
                  girderCount={parseInt(additionalGeometry.noOfGirders) || 4}
                  girderSpacing={parseFloat(additionalGeometry.girderSpacing) || 3}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <SettingsDialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen} />
      <Toaster />
    </div>
  );
};

// Root entry point providing global application context
const Index: React.FC = () => {
  return (
    <AppProvider>
      <DesignWorkspace />
    </AppProvider>
  );
};

export default Index;
