import { lazy } from 'react';

export const AboutContent = lazy(() => import('./components/AboutContent').then(module => ({ default: module.AboutContent })));
export const FAQContent = lazy(() => import('./components/FAQContent').then(module => ({ default: module.FAQContent })));
export const HeroImagesContent = lazy(() => import('./components/HeroImagesContent').then(module => ({ default: module.HeroImagesContent })));
export const HeroImagesMobileContent = lazy(() => import('./components/HeroImagesMobileContent').then(module => ({ default: module.HeroImagesMobileContent })));
export const TestimonialsContent = lazy(() => import('./components/TestimonialsContent').then(module => ({ default: module.TestimonialsContent })));
export const TermsAndConditionsContent = lazy(() => import('./components/TermsAndConditionsContent').then(module => ({ default: module.TermsAndConditionsContent })));
export const PoliciesContent = lazy(() => import('./components/PoliciesContent').then(module => ({ default: module.PoliciesContent })));
export const HowItWorksContent = lazy(() => import('./components/HowItWorksContent').then(module => ({ default: module.HowItWorksContent })));
export const StoreDetailsContent = lazy(() => import('./components/StoreDetailsContent').then(module => ({ default: module.StoreDetailsContent })));
export const Cards1Content = lazy(() => import('./components/Cards1Content').then(module => ({ default: module.Cards1Content })));
export const Cards2Content = lazy(() => import('./components/Cards2Content').then(module => ({ default: module.Cards2Content })));
