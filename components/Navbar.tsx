'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { UserRole } from '@prisma/client'
import { getAllCategories } from '@/data/categories'

export function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const productsDropdownRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const categories = getAllCategories()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
        setIsProductsDropdownOpen(false)
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current)
        }
      }
    }

    if (isProductsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [isProductsDropdownOpen])

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsProductsDropdownOpen(true)
    }, 1000) // 1 second delay
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    // Don't close immediately, let the dropdown handle its own hover
  }

  const handleDropdownMouseEnter = () => {
    // Clear any pending close timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setIsProductsDropdownOpen(true)
  }

  const handleDropdownMouseLeave = () => {
    setIsProductsDropdownOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-white/10 transition-all duration-300 ${
        scrolled
          ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-sky-900/95 shadow-lg'
          : 'bg-gradient-to-r from-slate-950 via-indigo-950 to-sky-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Logo + Search + Auth/Actions */}
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="UR Aerotech Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-white font-semibold text-xl tracking-tight">
                UR <span className="font-bold">Aerotech</span>
              </div>
              <div className="text-xs text-sky-100/80 uppercase tracking-[0.2em]">
                Aircraft Structure Repair
              </div>
            </div>
          </Link>

          {/* Search (desktop) */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="w-full max-w-md relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-200/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-slate-900/70 border border-slate-300/40 text-sm text-white placeholder-slate-200/70 focus:outline-none focus:ring-2 focus:ring-sky-400/80 focus:border-sky-400/80 shadow-sm"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Search icon (mobile) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle search"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Login / User */}
            {session ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href={session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="px-3 py-2 text-xs font-medium uppercase tracking-wide rounded-full border border-white/25 bg-white/5 text-white hover:bg-white/15 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-2 text-xs font-medium uppercase tracking-wide rounded-full border border-white/25 bg-white/5 text-white hover:bg-white/15 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signup"
                className="hidden md:inline-flex items-center px-5 py-2 text-sm font-medium rounded-full border border-white/60 bg-transparent text-white hover:bg-white/10 transition-colors"
              >
                Signup
              </Link>
            )}

            {/* Request a Quote */}
            <Link
              href="/quote"
              className="inline-flex items-center px-5 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:from-sky-400 hover:to-indigo-400 transition-transform hover:-translate-y-[1px]"
            >
              Request a Quote
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-3 px-1">
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-200/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-slate-900/80 border border-slate-300/40 text-sm text-white placeholder-slate-200/70 focus:outline-none focus:ring-2 focus:ring-sky-400/80 focus:border-sky-400/80"
              />
            </div>
          </div>
        )}

        {/* Bottom Row: Navigation links */}
        <div className="hidden lg:flex items-center h-12 text-sm text-slate-100/90 space-x-8">
          <Link
            href="/"
            className="relative py-3 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/services"
            className="relative py-3 hover:text-white transition-colors"
          >
            Solutions
          </Link>
          <Link
            href="/industries"
            className="relative py-3 hover:text-white transition-colors"
          >
            Industries
          </Link>
          {/* Products Dropdown */}
          <div 
            ref={productsDropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <Link
              href="/products"
              className="relative flex items-center gap-1 py-3 hover:text-white transition-colors"
            >
              Products
              <span className="text-xs">▼</span>
            </Link>
            {isProductsDropdownOpen && (
              <div 
                className="absolute top-full left-0 pt-2 w-80 z-[100]"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-sky-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-2">
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold mb-2"
                    onClick={() => {
                      setIsProductsDropdownOpen(false)
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current)
                      }
                    }}
                  >
                    All Products
                  </Link>
                  <div className="border-t border-white/10 my-2"></div>
                  <div className="grid grid-cols-1 gap-1 max-h-[500px] overflow-y-auto">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        className="flex items-center gap-3 px-4 py-3 text-slate-100/90 hover:bg-white/10 rounded-lg transition-colors group"
                        onClick={() => {
                          setIsProductsDropdownOpen(false)
                          if (hoverTimeoutRef.current) {
                            clearTimeout(hoverTimeoutRef.current)
                          }
                        }}
                      >
                        <span className="text-xl">{category.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                            {category.name}
                          </div>
                          <div className="text-xs text-slate-400">{category.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            )}
          </div>
          <Link
            href="/about"
            className="relative py-3 hover:text-white transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="relative py-3 hover:text-white transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-96 pb-3' : 'max-h-0'
          }`}
        >
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-4 py-2 text-sm text-slate-50/90 hover:bg-white/10 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/services"
              className="block px-4 py-2 text-sm text-slate-50/90 hover:bg-white/10 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Solutions
            </Link>
            <Link
              href="/industries"
              className="block px-4 py-2 text-sm text-slate-50/90 hover:bg-white/10 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Industries
            </Link>
            <div>
              <Link
                href="/products"
                className="block px-4 py-2 text-sm text-slate-50/90 hover:bg-white/10 rounded-md font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <div className="pl-4 mt-1 space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-50/70 hover:bg-white/10 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/about"
              className="block px-4 py-2 text-sm text-slate-50/90 hover:bg-white/10 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-sm text-slate-50/90 hover:bg-white/10 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
