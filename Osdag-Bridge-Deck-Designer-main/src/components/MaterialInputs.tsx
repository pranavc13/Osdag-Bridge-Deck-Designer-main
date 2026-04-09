import React from 'react';
import SectionHeader from './SectionHeader';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { steelGrades, concreteGrades } from '@/lib/locationData';

interface MaterialInputsProps {
  disabled: boolean;
  values: {
    girder: string;
    crossBracing: string;
    deck: string;
  };
  onChange: (field: string, value: string) => void;
}

const MaterialInputs: React.FC<MaterialInputsProps> = ({
  disabled,
  values,
  onChange,
}) => {
  const { language } = useApp();
  const t = useTranslation(language);

  return (
    <div className={`input-group overflow-hidden animate-slide-in ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <SectionHeader title={t('materialInputs')} />
      <div className="p-4 space-y-4">
        {/* Girder */}
        <div className="space-y-2">
          <Label className="text-sm">{t('girder')}</Label>
          <Select value={values.girder} onValueChange={(v) => onChange('girder', v)}>
            <SelectTrigger className="bg-info/10 border-info/30">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {steelGrades.map((grade) => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cross Bracing */}
        <div className="space-y-2">
          <Label className="text-sm">{t('crossBracing')}</Label>
          <Select value={values.crossBracing} onValueChange={(v) => onChange('crossBracing', v)}>
            <SelectTrigger className="bg-info/10 border-info/30">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {steelGrades.map((grade) => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Deck */}
        <div className="space-y-2">
          <Label className="text-sm">{t('deck')}</Label>
          <Select value={values.deck} onValueChange={(v) => onChange('deck', v)}>
            <SelectTrigger className="bg-info/10 border-info/30">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {concreteGrades.map((grade) => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default MaterialInputs;
