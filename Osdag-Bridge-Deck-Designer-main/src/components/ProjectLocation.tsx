import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { getStates, getDistrictsByState, getLocationData, LocationData } from '@/lib/locationData';
import CustomLoadingDialog from './CustomLoadingDialog';

interface ProjectLocationProps {
  disabled: boolean;
  locationData: LocationData | null;
  onLocationChange: (data: LocationData | null) => void;
}

const ProjectLocation: React.FC<ProjectLocationProps> = ({ 
  disabled, 
  locationData,
  onLocationChange 
}) => {
  const { language } = useApp();
  const t = useTranslation(language);
  
  const [mode, setMode] = useState<'location' | 'custom'>('location');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  const states = getStates();
  const districts = state ? getDistrictsByState(state) : [];

  useEffect(() => {
    if (state && district) {
      const data = getLocationData(state, district);
      onLocationChange(data || null);
    } else {
      onLocationChange(null);
    }
  }, [state, district]);

  const handleStateChange = (value: string) => {
    setState(value);
    setDistrict('');
  };

  const handleModeChange = (newMode: 'location' | 'custom') => {
    setMode(newMode);
    if (newMode === 'custom') {
      setState('');
      setDistrict('');
      onLocationChange(null);
    }
  };

  const handleCustomDataApply = (data: LocationData) => {
    onLocationChange(data);
    setCustomDialogOpen(false);
  };

  return (
    <div className={`input-group overflow-hidden animate-slide-in ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <SectionHeader title={t('projectLocation')} />
      <div className="p-4 space-y-4">
        {/* Mode Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="enterLocation"
              checked={mode === 'location'}
              onCheckedChange={() => handleModeChange('location')}
              className="data-[state=checked]:bg-warning data-[state=checked]:border-warning"
            />
            <Label htmlFor="enterLocation" className="text-sm cursor-pointer">
              {t('enterLocationName')}
            </Label>
          </div>
          
          <div className="flex items-center gap-3">
            <Checkbox
              id="customLoading"
              checked={mode === 'custom'}
              onCheckedChange={() => handleModeChange('custom')}
              className="data-[state=checked]:bg-warning data-[state=checked]:border-warning"
            />
            <Label htmlFor="customLoading" className="text-sm cursor-pointer">
              {t('tabulateCustom')}
            </Label>
            {mode === 'custom' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setCustomDialogOpen(true)}
                className="ml-2"
              >
                {t('openSpreadsheet')}
              </Button>
            )}
          </div>
        </div>

        {/* Location Dropdowns */}
        {mode === 'location' && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('state')}</Label>
              <Select value={state} onValueChange={handleStateChange}>
                <SelectTrigger className="bg-info/10 border-info/30">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('district')}</Label>
              <Select value={district} onValueChange={setDistrict} disabled={!state}>
                <SelectTrigger className="bg-info/10 border-info/30">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Display Location Values */}
        {locationData && (
          <div className="mt-4 p-3 bg-muted rounded-lg space-y-2 animate-fade-in">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('basicWindSpeed')}:</span>
                <span className="value-display">{locationData.basicWindSpeed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('seismicZone')}:</span>
                <span className="value-display">{locationData.seismicZone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('zoneFactor')}:</span>
                <span className="value-display">{locationData.zoneFactor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('maxTemp')}:</span>
                <span className="value-display">{locationData.maxTemp}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-muted-foreground">{t('minTemp')}:</span>
                <span className="value-display">{locationData.minTemp}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <CustomLoadingDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        onApply={handleCustomDataApply}
      />
    </div>
  );
};

export default ProjectLocation;
