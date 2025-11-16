import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "US";

  const AuthButtons = (
    <>
      <Link to="/login">
        <Button variant="ghost" className="w-full md:w-auto">Entrar</Button>
      </Link>
      <Link to="/register">
        <Button className="w-full md:w-auto">Cadastrar</Button>
      </Link>
    </>
  );

  const UserMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.email || "Usuário"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => alert("Perfil clicado")}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileMenu = (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <nav className="flex flex-col gap-4 pt-6">
          <Link to="/" className="text-lg font-semibold">
            Home
          </Link>
          <Link to="/dashboard" className="text-lg font-semibold">
            Dashboard
          </Link>
          <div className="mt-4 space-y-2">
            {!isAuthenticated && AuthButtons}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-4 z-50 mx-auto w-[95%] max-w-7xl">
      <div className="flex items-center justify-between rounded-xl border bg-background/80 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          {MobileMenu}
          <Link to="/" className="text-xl font-bold text-primary">
            App
          </Link>
        </div>

        {/* Search Bar (Desktop/Tablet) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar..."
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Auth/User Actions */}
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : isAuthenticated ? (
            UserMenu
          ) : (
            <div className="hidden md:flex space-x-2">{AuthButtons}</div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;