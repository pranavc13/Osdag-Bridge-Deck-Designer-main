import {
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';

interface HeaderProps {
  onSettingsClick: () => void;
}

/**
 * Application Header Component
 * 
 * Provides the top-level navigation and identity for the Osdag application.
 * Contains:
 * - Application Brand/Logo
 * - Standard Menu Bar (File, Edit, etc.) for desktop-like interaction
 * - Global Settings Trigger
 */
const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const { language } = useApp();
  const t = useTranslation(language);

  return (
    <header className="bg-header text-header-foreground h-12 flex items-center justify-between px-4 shadow-md z-50 relative">
      {/* Branding Section */}
      <div className="flex items-center gap-3 select-none">
        <img src="/osdag-logo.svg" alt="Osdag Logo" className="w-8 h-8 rounded" />
        <h1 className="text-lg font-semibold tracking-wide">Group Design</h1>
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center gap-2">

        {/* Desktop Menu Bar */}
        {/* Hidden on mobile to save space, should be replaced with a hamburger menu on smaller screens */}
        {/* Desktop Menu Bar Removed as per user request */}

        {/* Global Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          className="text-header-foreground hover:bg-sidebar-accent"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
