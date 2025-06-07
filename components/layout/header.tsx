"use client";

import { Button } from "@/components/ui/button";
import { SignInDialog } from "@/components/sign_in/sign-in-dialog";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, MoveRight, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase-client'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

interface Header1Props {
    heroHeight: number;
}

function Header1({ heroHeight }: Header1Props) {
    const { user, session } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const isLandingPage = pathname === '/'
    const [isOpen, setOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isDarkHeader, setIsDarkHeader] = useState(isLandingPage); // Start dark only on landing page

    const navigationItems = [
        { name: 'Documentation', href: '/docs', public: true },
        { name: 'Chat', href: '/chat', public: true },
        { name: 'Models', href: '/models', public: true },
        { name: 'Pricing', href: '/pricing', public: true },
        { name: 'Dashboard', href: '/dashboard', public: false },
    ];

    // Strict filtering of navigation items
    const filteredNavigationItems = navigationItems.filter(item => {
        return item.public || (user !== null && !item.public);
    });

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const getAvatarUrl = () => {
        if (!user) return null;
        console.log('Getting avatar for user:', user);

        // For GitHub
        if (user.app_metadata?.provider === 'github') {
            return user.user_metadata?.avatar_url;
        }

        // For Google
        if (user.app_metadata?.provider === 'google') {
            return user.user_metadata?.picture;
        }

        // Fallback to email-based avatar
        if (user.email) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random`;
        }

        return null;
    }

    const handleMenuItemClick = (path: string) => {
        setIsDropdownOpen(false) // Close dropdown
        setOpen(false) // Close mobile menu
        router.push(path)
    }

    useEffect(() => {
        if (user) {
            console.log('User in header:', user);
            console.log('Avatar URL:', getAvatarUrl());
        }

        const handleScroll = () => {
            const scrolledPastHero = window.scrollY > heroHeight - 50; // Adjust 50px for a smoother transition
            setIsDarkHeader(!scrolledPastHero);
        };

        if (isLandingPage) {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        } else {
            setIsDarkHeader(false); // Always light on other pages
        }
    }, [user, heroHeight, isLandingPage]);

    // Combine navigation and user menu items
    const allMenuItems = [
        ...navigationItems,
        ...(user ? [
            { name: 'API Keys', href: '/dashboard/api-security', public: false },
            { name: 'Settings', href: '/settings', public: false },
        ] : [])
    ];

    const headerClasses = `
        fixed left-1/2 -translate-x-1/2 top-4 w-[95%] max-w-7xl z-[100] rounded-2xl border shadow-lg
        transition-colors duration-300
        ${isDarkHeader ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'}
    `;

    const textColorClass = isDarkHeader ? 'text-white' : 'text-gray-900';
    const linkHoverClass = isDarkHeader ? 'hover:text-gray-300' : 'hover:text-gray-700';
    const mobileMenuBgClass = isDarkHeader ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-t';
    const mobileMenuTextClass = isDarkHeader ? 'text-white' : 'text-gray-900';
    const mobileMenuHoverBgClass = isDarkHeader ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
    const mobileMenuUserBgClass = isDarkHeader ? 'bg-gray-800' : 'bg-gray-50';
    const mobileMenuUserTextClass = isDarkHeader ? 'text-gray-200' : 'text-gray-900';
    const mobileMenuSignOutHoverClass = isDarkHeader ? 'hover:bg-red-700 hover:text-white' : 'hover:bg-red-50 text-red-600';


    return (
        <header className={headerClasses}>
            <div className="container mx-auto h-16 px-4 sm:px-8 flex items-center">
                {/* Mobile Menu Button - Absolute positioned */}
                <div className="lg:hidden absolute left-4 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(!isOpen)}
                        className={isDarkHeader ? 'text-white' : 'text-gray-900'}
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Logo - Always centered on mobile */}
                <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:left-0 lg:w-[140px] lg:flex-none">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="MakeHub Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10"
                        />
                        <span className={`text-2xl font-bold ${isDarkHeader ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'}`}>
                            MakeHub
                        </span>
                    </Link>
                </div>

                {/* Navigation - Hidden on mobile, centered on desktop */}
                <div className="hidden lg:flex flex-1 justify-center">
                    <NavigationMenu>
                        <NavigationMenuList className="flex gap-2">
                            {filteredNavigationItems.map((item) => (
                                <NavigationMenuItem key={item.name}>
                                    <Link href={item.href} legacyBehavior passHref>
                                        <NavigationMenuLink 
                                            className={`${navigationMenuTriggerStyle()} font-bold px-5 py-2 ${textColorClass} ${linkHoverClass}`}
                                            style={{ fontSize: '17px' }}
                                        >
                                            {item.name}
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right Section - Always visible and right-aligned */}
                <div className="ml-auto lg:ml-0 flex-none w-[140px] flex justify-end">
                    {user ? (
                        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                        {getAvatarUrl() ? (
                                            <Image
                                                src={getAvatarUrl()!}
                                                alt="Profile"
                                                width={40}
                                                height={40}
                                                className="size-full rounded-full object-cover"
                                                priority
                                            />
                                        ) : (
                                            <User className={`h-6 w-6 ${textColorClass}`} />
                                        )}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                align="end" 
                                className={`w-56 sm:w-64 z-[200] ${isDarkHeader ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}
                                onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                                <DropdownMenuLabel className={`break-all ${textColorClass}`}>
                                    {user.email}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className={isDarkHeader ? 'bg-gray-700' : ''} />
                                <DropdownMenuItem
                                    onClick={() => handleMenuItemClick('/dashboard/api-security')}
                                    className={`cursor-pointer ${isDarkHeader ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                >
                                    API Keys
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => handleMenuItemClick('/reload')}
                                    className={`cursor-pointer ${isDarkHeader ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                >
                                    Add Credits
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className={isDarkHeader ? 'bg-gray-700' : ''} />
                                <DropdownMenuItem 
                                    onClick={() => {
                                        setIsDropdownOpen(false)
                                        handleSignOut()
                                    }}
                                    className={`cursor-pointer ${mobileMenuSignOutHoverClass}`}
                                >
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <SignInDialog className={`
                            ${isDarkHeader 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                            }
                        `} />
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div 
                    className={`absolute inset-x-0 top-16 z-[100] backdrop-blur-sm rounded-b-2xl lg:hidden ${mobileMenuBgClass}`}
                    onClick={() => setOpen(false)}
                >
                    <div 
                        className="max-h-[calc(100vh-8rem)] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="container py-4">
                            {/* User Profile Section */}
                            {user && (
                                <div className={`flex items-center gap-4 p-4 mb-2 rounded-lg ${mobileMenuUserBgClass}`}>
                                    <div className="h-10 w-10 rounded-full overflow-hidden border shadow-sm">
                                        {getAvatarUrl() ? (
                                            <Image
                                                src={getAvatarUrl()!}
                                                alt="Profile"
                                                width={40}
                                                height={40}
                                                className="h-full w-full object-cover"
                                                priority
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-muted flex items-center justify-center">
                                                <User className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm truncate ${mobileMenuUserTextClass}`}>
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Items */}
                            <nav className="space-y-1">
                                {allMenuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center justify-between p-3 rounded-md transition-colors ${mobileMenuHoverBgClass}`}
                                    >
                                        <span className={`text-sm font-medium ${mobileMenuTextClass}`}>
                                            {item.name}
                                        </span>
                                        <MoveRight className={`h-4 w-4 ${isDarkHeader ? 'text-gray-400' : 'text-gray-400'}`} />
                                    </Link>
                                ))}

                                {/* Auth Actions */}
                                {user ? (
                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            handleSignOut();
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-md transition-colors ${mobileMenuSignOutHoverClass}`}
                                    >
                                        <span className="text-sm font-medium">Sign out</span>
                                        <MoveRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <div className="pt-4 space-y-2 border-t mt-4">
                                        <SignInDialog />
                                    </div>
                                )}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export { Header1 };
