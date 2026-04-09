import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';

interface ModifyGeometryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carriageWay: number;
  values: {
    girderSpacing: string;
    noOfGirders: string;
    deckOverhang: string;
  };
  onApply: (values: { girderSpacing: string; noOfGirders: string; deckOverhang: string }) => void;
}

const ModifyGeometryDialog: React.FC<ModifyGeometryDialogProps> = ({
  open,
  onOpenChange,
  carriageWay,
  values: initialValues,
  onApply,
}) => {
  const { language } = useApp();
  const t = useTranslation(language);
  
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastChanged, setLastChanged] = useState<string>('');

  const overallBridgeWidth = carriageWay + 5;

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues, open]);

  // Auto-calculate interdependent fields
  // Formula: (Overall Width – Overhang) / Spacing = No. of Girders
  useEffect(() => {
    if (!lastChanged) return;

    const spacing = parseFloat(values.girderSpacing) || 0;
    const girders = parseFloat(values.noOfGirders) || 0;
    const overhang = parseFloat(values.deckOverhang) || 0;

    if (lastChanged === 'girderSpacing' && spacing > 0 && overhang > 0) {
      // Calculate number of girders
      const newGirders = Math.round((overallBridgeWidth - overhang) / spacing);
      setValues((prev) => ({ ...prev, noOfGirders: newGirders.toString() }));
    } else if (lastChanged === 'noOfGirders' && girders > 0 && overhang > 0) {
      // Calculate girder spacing
      const newSpacing = ((overallBridgeWidth - overhang) / girders).toFixed(1);
      setValues((prev) => ({ ...prev, girderSpacing: newSpacing }));
    } else if (lastChanged === 'deckOverhang' && spacing > 0 && girders > 0) {
      // Recalculate overhang based on formula rearrangement
      // overhang = overallWidth - (spacing * girders)
      const newOverhang = (overallBridgeWidth - spacing * girders).toFixed(1);
      if (parseFloat(newOverhang) >= 0) {
        setValues((prev) => ({ ...prev, deckOverhang: newOverhang }));
      }
    }
  }, [values.girderSpacing, values.noOfGirders, values.deckOverhang, lastChanged, overallBridgeWidth]);

  // Validate
  useEffect(() => {
    const newErrors: string[] = [];
    const spacing = parseFloat(values.girderSpacing) || 0;
    const girders = parseFloat(values.noOfGirders) || 0;
    const overhang = parseFloat(values.deckOverhang) || 0;

    if (girders > 0 && !Number.isInteger(girders)) {
      newErrors.push(t('girderIntegerError'));
    }

    if (spacing >= overallBridgeWidth || overhang >= overallBridgeWidth) {
      newErrors.push(t('girderError'));
    }

    setErrors(newErrors);
  }, [values, overallBridgeWidth, t]);

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setLastChanged(field);
  };

  const handleApply = () => {
    if (errors.length === 0) {
      onApply(values);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold bg-warning/90 text-warning-foreground -mx-6 -mt-6 px-6 py-3 rounded-t-lg">
            {t('modifyAdditionalGeometry')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Overall Bridge Width Display */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('overallBridgeWidth')}:</span>
              <span className="value-display">{overallBridgeWidth.toFixed(1)} m</span>
            </div>
          </div>

          {/* Girder Spacing */}
          <div className="space-y-2">
            <Label className="text-sm">{t('girderSpacing')}</Label>
            <Input
              type="number"
              step="0.1"
              value={values.girderSpacing}
              onChange={(e) => handleChange('girderSpacing', e.target.value)}
              placeholder="e.g., 2.5"
            />
          </div>

          {/* Number of Girders */}
          <div className="space-y-2">
            <Label className="text-sm">{t('noOfGirders')}</Label>
            <Input
              type="number"
              value={values.noOfGirders}
              onChange={(e) => handleChange('noOfGirders', e.target.value)}
              placeholder="e.g., 4"
            />
          </div>

          {/* Deck Overhang Width */}
          <div className="space-y-2">
            <Label className="text-sm">{t('deckOverhangWidth')}</Label>
            <Input
              type="number"
              step="0.1"
              value={values.deckOverhang}
              onChange={(e) => handleChange('deckOverhang', e.target.value)}
              placeholder="e.g., 1.0"
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md"
                >
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-xs text-destructive">{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleApply} disabled={errors.length > 0}>
            {t('apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyGeometryDialog;
