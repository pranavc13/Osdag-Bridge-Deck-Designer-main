import React, { useState } from 'react';
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
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { LocationData } from '@/lib/locationData';

interface CustomLoadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (data: LocationData) => void;
}

const CustomLoadingDialog: React.FC<CustomLoadingDialogProps> = ({
  open,
  onOpenChange,
  onApply,
}) => {
  const { language } = useApp();
  const t = useTranslation(language);
  
  const [values, setValues] = useState({
    basicWindSpeed: '',
    seismicZone: '',
    zoneFactor: '',
    maxTemp: '',
    minTemp: '',
  });

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    const data: LocationData = {
      state: 'Custom',
      district: 'Custom',
      basicWindSpeed: parseFloat(values.basicWindSpeed) || 0,
      seismicZone: values.seismicZone || 'N/A',
      zoneFactor: parseFloat(values.zoneFactor) || 0,
      maxTemp: parseFloat(values.maxTemp) || 0,
      minTemp: parseFloat(values.minTemp) || 0,
    };
    onApply(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t('tabulateCustom')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 border-b border-border font-medium">Parameter</th>
                  <th className="text-left p-3 border-b border-border font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">{t('basicWindSpeed')}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={values.basicWindSpeed}
                      onChange={(e) => handleChange('basicWindSpeed', e.target.value)}
                      className="h-8"
                      placeholder="e.g., 44"
                    />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">{t('seismicZone')}</td>
                  <td className="p-2">
                    <Input
                      type="text"
                      value={values.seismicZone}
                      onChange={(e) => handleChange('seismicZone', e.target.value)}
                      className="h-8"
                      placeholder="e.g., III"
                    />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">{t('zoneFactor')}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={values.zoneFactor}
                      onChange={(e) => handleChange('zoneFactor', e.target.value)}
                      className="h-8"
                      placeholder="e.g., 0.16"
                    />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">{t('maxTemp')}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={values.maxTemp}
                      onChange={(e) => handleChange('maxTemp', e.target.value)}
                      className="h-8"
                      placeholder="e.g., 45"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">{t('minTemp')}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={values.minTemp}
                      onChange={(e) => handleChange('minTemp', e.target.value)}
                      className="h-8"
                      placeholder="e.g., 10"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleApply}>
            {t('apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomLoadingDialog;
