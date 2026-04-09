import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Language, languages, useTranslation } from '@/lib/i18n';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const { language, setLanguage, theme, setTheme, units, setUnits, autoSave, setAutoSave, highContrast, setHighContrast } = useApp();
  const t = useTranslation(language);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {t('settings')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {t('language')}
            </Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {Object.entries(languages).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {t('theme')}
            </Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4" />
                {t('light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4" />
                {t('dark')}
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4 space-y-4">
            {/* Units Display */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground flex flex-col">
                <span>{t('unitsDisplay') || 'Units Display'}</span>
                <span className="text-xs font-normal text-muted-foreground">{t('unitsDesc') || 'Visual reference only'}</span>
              </Label>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                <Button
                  variant={units === 'metric' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setUnits('metric')}
                >
                  Metric (m)
                </Button>
                <Button
                  variant={units === 'imperial' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setUnits('imperial')}
                >
                  Imperial (ft)
                </Button>
              </div>
            </div>

            {/* Auto Save */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground flex flex-col">
                <span>{t('autoSave') || 'Auto Save'}</span>
                <span className="text-xs font-normal text-muted-foreground">{t('autoSaveDesc') || 'Show save notifications'}</span>
              </Label>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground flex flex-col">
                <span>{t('highContrast') || 'High Contrast'}</span>
                <span className="text-xs font-normal text-muted-foreground">{t('accessibilityMode') || 'Accessibility mode'}</span>
              </Label>
              <Switch
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
