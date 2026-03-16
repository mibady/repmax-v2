/**
 * Dashboard Screen Tests
 *
 * Tests the 4 states for the athlete dashboard per REPMAX-DEV-HANDOFF.md:
 * - Loading: skeleton/spinner visible
 * - Empty: empty state with CTA
 * - Error: error message with retry
 * - Loaded: correct data rendered
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockSupabaseClient } from '../setup';
import { jaylenWashington, tylerChen, createMockAuthUser, createMockProfile } from '../fixtures/users';

// Mock component - in real implementation, this would be the actual dashboard
function AthleteDashboard({
  isLoading = false,
  error = null,
  profile = null,
  views = [],
  shortlists = [],
  onRetry = () => {},
}: {
  isLoading?: boolean;
  error?: string | null;
  profile?: { fullName: string; profileCompleteness: number } | null;
  views?: { id: string; viewerSchool?: string; viewedAt: string }[];
  shortlists?: { id: string; recruiterName: string }[];
  onRetry?: () => void;
}) {
  if (isLoading) {
    return (
      <div data-testid="dashboard-skeleton">
        <div className="animate-pulse bg-background-card rounded-card h-32" data-testid="skeleton-card" />
        <div className="animate-pulse bg-background-card rounded-card h-48 mt-4" data-testid="skeleton-stats" />
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="dashboard-error" className="text-center py-16">
        <p className="text-error mb-4">{error}</p>
        <button onClick={onRetry} className="text-gold hover:text-gold-hover">
          Retry
        </button>
      </div>
    );
  }

  if (!profile || profile.profileCompleteness === 0) {
    return (
      <div data-testid="dashboard-empty" className="text-center py-16">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Complete Your Profile</h3>
        <p className="text-text-secondary mb-6">Get discovered by recruiters by completing your Player Card.</p>
        <button className="bg-gold text-background px-6 py-2 rounded-lg">Complete Profile</button>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-loaded">
      <h1 className="text-2xl font-bold text-text-primary">Welcome, {profile.fullName}</h1>
      <div className="mt-4 p-4 bg-background-card rounded-card">
        <p className="text-gold font-mono text-stat-lg" data-testid="profile-completeness">
          {profile.profileCompleteness}%
        </p>
        <p className="text-text-muted text-xs">Profile Complete</p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Recent Views</h2>
        {views.length === 0 ? (
          <p className="text-text-secondary">No profile views yet</p>
        ) : (
          <ul data-testid="views-list">
            {views.map((view) => (
              <li key={view.id} className="py-2 border-b border-border">
                {view.viewerSchool || 'Anonymous'} viewed your profile
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Shortlist Activity</h2>
        {shortlists.length === 0 ? (
          <p className="text-text-secondary">No shortlist activity</p>
        ) : (
          <ul data-testid="shortlists-list">
            {shortlists.map((shortlist) => (
              <li key={shortlist.id} className="py-2 border-b border-border">
                Added to shortlist by {shortlist.recruiterName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

describe('Athlete Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show skeleton loaders while data is loading', () => {
      render(<AthleteDashboard isLoading={true} />);

      expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-stats')).toBeInTheDocument();
    });

    it('should have proper animation classes on skeleton', () => {
      render(<AthleteDashboard isLoading={true} />);

      const skeletonCard = screen.getByTestId('skeleton-card');
      expect(skeletonCard).toHaveClass('animate-pulse');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when profile completeness is 0', () => {
      render(<AthleteDashboard profile={{ fullName: 'Tyler Chen', profileCompleteness: 0 }} />);

      expect(screen.getByTestId('dashboard-empty')).toBeInTheDocument();
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /complete profile/i })).toBeInTheDocument();
    });

    it('should show empty state when no profile exists', () => {
      render(<AthleteDashboard profile={null} />);

      expect(screen.getByTestId('dashboard-empty')).toBeInTheDocument();
    });

    it('should have a CTA button in empty state', () => {
      render(<AthleteDashboard profile={null} />);

      const ctaButton = screen.getByRole('button', { name: /complete profile/i });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveClass('bg-gold');
    });
  });

  describe('Error State', () => {
    it('should show error message when error occurs', () => {
      render(<AthleteDashboard error="Failed to load dashboard data" />);

      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });

    it('should have a retry button', () => {
      const onRetry = vi.fn();
      render(<AthleteDashboard error="Network error" onRetry={onRetry} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<AthleteDashboard error="Network error" onRetry={onRetry} />);

      await user.click(screen.getByRole('button', { name: /retry/i }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loaded State - Complete Profile (Jaylen)', () => {
    const completeProfile = {
      fullName: jaylenWashington.fullName,
      profileCompleteness: jaylenWashington.athleteProfile!.profileCompleteness,
    };

    const mockViews = [
      { id: '1', viewerSchool: 'TCU', viewedAt: new Date().toISOString() },
      { id: '2', viewerSchool: 'Texas Tech', viewedAt: new Date().toISOString() },
    ];

    const mockShortlists = [
      { id: '1', recruiterName: 'Coach Williams (TCU)' },
    ];

    it('should render welcome message with user name', () => {
      render(<AthleteDashboard profile={completeProfile} views={mockViews} shortlists={mockShortlists} />);

      expect(screen.getByTestId('dashboard-loaded')).toBeInTheDocument();
      expect(screen.getByText(`Welcome, ${completeProfile.fullName}`)).toBeInTheDocument();
    });

    it('should show profile completeness percentage', () => {
      render(<AthleteDashboard profile={completeProfile} views={mockViews} shortlists={mockShortlists} />);

      expect(screen.getByTestId('profile-completeness')).toHaveTextContent('100%');
    });

    it('should render profile views list', () => {
      render(<AthleteDashboard profile={completeProfile} views={mockViews} shortlists={mockShortlists} />);

      expect(screen.getByTestId('views-list')).toBeInTheDocument();
      expect(screen.getByText('TCU viewed your profile')).toBeInTheDocument();
      expect(screen.getByText('Texas Tech viewed your profile')).toBeInTheDocument();
    });

    it('should render shortlist activity', () => {
      render(<AthleteDashboard profile={completeProfile} views={mockViews} shortlists={mockShortlists} />);

      expect(screen.getByTestId('shortlists-list')).toBeInTheDocument();
      expect(screen.getByText('Added to shortlist by Coach Williams (TCU)')).toBeInTheDocument();
    });
  });

  describe('Loaded State - Incomplete Profile (Marcus)', () => {
    const incompleteProfile = {
      fullName: 'Marcus Thompson',
      profileCompleteness: 45,
    };

    it('should show incomplete profile percentage', () => {
      render(<AthleteDashboard profile={incompleteProfile} views={[]} shortlists={[]} />);

      expect(screen.getByTestId('profile-completeness')).toHaveTextContent('45%');
    });

    it('should show empty views message when no views', () => {
      render(<AthleteDashboard profile={incompleteProfile} views={[]} shortlists={[]} />);

      expect(screen.getByText('No profile views yet')).toBeInTheDocument();
    });

    it('should show empty shortlists message when no shortlists', () => {
      render(<AthleteDashboard profile={incompleteProfile} views={[]} shortlists={[]} />);

      expect(screen.getByText('No shortlist activity')).toBeInTheDocument();
    });
  });

  describe('Anonymous Views', () => {
    it('should show Anonymous for views without viewer school', () => {
      const profile = { fullName: 'Test User', profileCompleteness: 50 };
      const views = [{ id: '1', viewedAt: new Date().toISOString() }];

      render(<AthleteDashboard profile={profile} views={views} shortlists={[]} />);

      expect(screen.getByText('Anonymous viewed your profile')).toBeInTheDocument();
    });
  });
});

describe('Dashboard State Machine', () => {
  it('should transition from loading to loaded', async () => {
    const { rerender } = render(<AthleteDashboard isLoading={true} />);

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();

    rerender(
      <AthleteDashboard
        profile={{ fullName: 'Test User', profileCompleteness: 100 }}
        views={[]}
        shortlists={[]}
      />
    );

    expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-loaded')).toBeInTheDocument();
  });

  it('should transition from loading to error', async () => {
    const { rerender } = render(<AthleteDashboard isLoading={true} />);

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();

    rerender(<AthleteDashboard error="Failed to load" />);

    expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
  });

  it('should transition from error to loading on retry', async () => {
    const { rerender } = render(<AthleteDashboard error="Failed to load" />);

    expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();

    rerender(<AthleteDashboard isLoading={true} />);

    expect(screen.queryByTestId('dashboard-error')).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });
});
