import { Link, useLocation } from 'react-router-dom';
import { Users, Trash2, History } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

function AppShell({ children, actions }) {
  const location = useLocation();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-6">
            <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                <Users className="h-4 w-4" />
              </span>
              <span className="hidden sm:inline">Central de Leads</span>
            </Link>

            <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
              <Link
                to="/"
                className={cn(
                  'rounded-md px-2 py-1.5 sm:px-3',
                  location.pathname === '/'
                    ? 'bg-surface-2 font-medium text-foreground'
                    : 'text-muted hover:bg-surface-2 hover:text-foreground'
                )}
              >
                Leads
              </Link>
              <Link
                to="/cadastro"
                className={cn(
                  'rounded-md px-2 py-1.5 sm:px-3',
                  location.pathname === '/cadastro' || location.pathname.startsWith('/editar/')
                    ? 'bg-surface-2 font-medium text-foreground'
                    : 'text-muted hover:bg-surface-2 hover:text-foreground'
                )}
              >
                Cadastro
              </Link>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            {actions}
            <Button
              asChild
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Histórico"
              title="Histórico"
            >
              <Link
                to="/historico"
                className={cn(
                  location.pathname === '/historico' && 'bg-surface-2 text-foreground'
                )}
              >
                <History className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Lixeira"
              title="Lixeira"
            >
              <Link
                to="/lixeira"
                className={cn(
                  location.pathname === '/lixeira' && 'bg-surface-2 text-foreground'
                )}
              >
                <Trash2 className="h-4 w-4" />
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col overflow-x-hidden p-3 sm:p-6">
        {children}
      </main>
    </div>
  );
}

export default AppShell;
