import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { footpathOptions } from '@/lib/locationData';
import ModifyGeometryDialog from './ModifyGeometryDialog';

interface GeometricDetailsProps {
  disabled: boolean;
  values: {
    span: string;
    carriageWay: string;
    footpath: string;
    skewAngle: string;
  };
  onChange: (field: string, value: string) => void;
  geometryValues: {
    girderSpacing: string;
    noOfGirders: string;
    deckOverhang: string;
  };
  onGeometryChange: (values: { girderSpacing: string; noOfGirders: string; deckOverhang: string }) => void;
}

const GeometricDetails: React.FC<GeometricDetailsProps> = ({
  disabled,
  values,
  onChange,
  geometryValues,
  onGeometryChange,
}) => {
  const { language } = useApp();
  const t = useTranslation(language);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);

  // Validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    const span = parseFloat(values.span);
    if (values.span && (span < 20 || span > 45)) {
      newErrors.span = t('spanError');
    }
    
    const carriageway = parseFloat(values.carriageWay);
    if (values.carriageWay && (carriageway < 4.25 || carriageway > 24)) {
      newErrors.carriageWay = t('carriageError');
    }
    
    const skew = parseFloat(values.skewAngle);
    if (values.skewAngle && (skew < -15 || skew > 15)) {
      newErrors.skewAngle = t('skewError');
    }
    
    setErrors(newErrors);
  }, [values, t]);

  const overallBridgeWidth = values.carriageWay 
    ? (parseFloat(values.carriageWay) + 5).toFixed(1) 
    : '';

  return (
    <div className={`input-group overflow-hidden animate-slide-in ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <SectionHeader title={t('geometricDetails')} />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('geometricDetails')}</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setModifyDialogOpen(true)}
            className="bg-warning/90 hover:bg-warning text-warning-foreground"
          >
            {t('modifyAdditionalGeometry')}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Span */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('span')}</Label>
            <Input
              type="number"
              value={values.span}
              onChange={(e) => onChange('span', e.target.value)}
              placeholder="20-45"
              className={errors.span ? 'border-destructive' : ''}
            />
            {errors.span && (
              <p className="error-text flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.span}
              </p>
            )}
          </div>

          {/* Carriageway Width */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('carriageWay')}</Label>
            <Input
              type="number"
              value={values.carriageWay}
              onChange={(e) => onChange('carriageWay', e.target.value)}
              placeholder="4.25-24"
              className={errors.carriageWay ? 'border-destructive' : ''}
            />
            {errors.carriageWay && (
              <p className="error-text flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.carriageWay}
              </p>
            )}
          </div>

          {/* Footpath */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('footpath')}</Label>
            <Select value={values.footpath} onValueChange={(v) => onChange('footpath', v)}>
              <SelectTrigger className="bg-info/10 border-info/30">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {footpathOptions.map((opt) => (
                  <SelectItem key={opt} value={opt.toLowerCase()}>
                    {t(opt.toLowerCase().replace('-', '')) || opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skew Angle */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('skewAngle')}</Label>
            <Input
              type="number"
              value={values.skewAngle}
              onChange={(e) => onChange('skewAngle', e.target.value)}
              placeholder="-15 to +15"
              className={errors.skewAngle ? 'border-destructive' : ''}
            />
            {errors.skewAngle && (
              <p className="error-text flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.skewAngle}
              </p>
            )}
          </div>
        </div>

        {/* Overall Bridge Width Display */}
        {overallBridgeWidth && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('overallBridgeWidth')}:</span>
              <span className="value-display">{overallBridgeWidth} m</span>
            </div>
          </div>
        )}
      </div>

      <ModifyGeometryDialog
        open={modifyDialogOpen}
        onOpenChange={setModifyDialogOpen}
        carriageWay={parseFloat(values.carriageWay) || 0}
        values={geometryValues}
        onApply={onGeometryChange}
      />
    </div>
  );
};

export default GeometricDetails;
