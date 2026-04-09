import React from 'react';
import SectionHeader from './SectionHeader';
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

interface TypeOfStructureProps {
  value: string;
  onChange: (value: string) => void;
}

const TypeOfStructure: React.FC<TypeOfStructureProps> = ({ value, onChange }) => {
  const { language } = useApp();
  const t = useTranslation(language);

  return (
    <div className="input-group overflow-hidden animate-slide-in">
      <SectionHeader title={t('typeOfStructure')} />
      <div className="p-4 space-y-3">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full bg-info/10 border-info/30 focus:ring-info">
            <SelectValue placeholder="Select structure type" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="highway">{t('highway')}</SelectItem>
            <SelectItem value="other">{t('other')}</SelectItem>
          </SelectContent>
        </Select>
        
        {value === 'other' && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md animate-fade-in">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <span className="text-sm text-destructive font-medium">
              {t('otherNotIncluded')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypeOfStructure;
