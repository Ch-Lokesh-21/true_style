import type { NavigateFunction } from 'react-router-dom';

class NavigationService {
  private navigate: NavigateFunction | null = null;

  setNavigate(navigateFunction: NavigateFunction) {
    this.navigate = navigateFunction;
  }

  navigateTo(path: string, options?: { replace?: boolean; state?: unknown }) {
    if (this.navigate) {
      this.navigate(path, options);
    }
  }

  getNavigate() {
    return this.navigate;
  }
}

export const navigationService = new NavigationService();
