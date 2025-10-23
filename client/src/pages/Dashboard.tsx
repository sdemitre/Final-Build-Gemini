import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mock data interfaces
interface DashboardStats {
  submittedPapers: number;
  pendingReviews: number;
  activeCollaborations: number;
  profileViews: number;
}

interface RecentActivity {
  id: string;
  type: 'paper_submitted' | 'review_received' | 'collaboration_request' | 'profile_view';
  title: string;
  description: string;
  timestamp: string;
  actionUrl?: string;
}

interface QuickAction {
  title: string;
  description: string;
  url: string;
  icon: string;
  isPrimary?: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Simulate API call
      setTimeout(() => {
        setStats({
          submittedPapers: 3,
          pendingReviews: 2,
          activeCollaborations: 1,
          profileViews: 45,
        });

        setRecentActivity([
          {
            id: '1',
            type: 'review_received',
            title: 'New Review Received',
            description: 'Dr. Sarah Johnson reviewed your paper "COVID-19 Transmission Patterns"',
            timestamp: '2 hours ago',
            actionUrl: '/papers/123',
          },
          {
            id: '2',
            type: 'collaboration_request',
            title: 'Collaboration Request',
            description: 'Dr. Michael Chen wants to collaborate on malaria research',
            timestamp: '1 day ago',
            actionUrl: '/collaborations',
          },
          {
            id: '3',
            type: 'paper_submitted',
            title: 'Paper Submitted Successfully',
            description: 'Your paper "Dengue Prevention Strategies" is now under review',
            timestamp: '3 days ago',
            actionUrl: '/papers/124',
          },
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  const quickActions: QuickAction[] = [
    {
      title: 'Submit New Paper',
      description: 'Share your research for peer review',
      url: '/submit-paper',
      icon: '📄',
      isPrimary: true,
    },
    {
      title: 'Browse Papers',
      description: 'Find research to review or collaborate on',
      url: '/papers',
      icon: '🔍',
    },
    {
      title: 'Find Collaborators',
      description: 'Connect with other researchers',
      url: '/researchers',
      icon: '🤝',
    },
    {
      title: 'View Job Opportunities',
      description: 'Explore career opportunities',
      url: '/jobs',
      icon: '💼',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'paper_submitted': return '📄';
      case 'review_received': return '⭐';
      case 'collaboration_request': return '🤝';
      case 'profile_view': return '👁️';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard">
        {/* Welcome Header */}
        <div className="dashboard-header mb-6">
          <h1>Welcome back, {user?.firstName}!</h1>
          <p className="text-lg text-gray-600">
            Here's what's happening with your research activities.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-4 mb-6">
          <div className="card">
            <div className="card-body">
              <div className="stat-item">
                <div className="stat-number text-primary-blue">{stats?.submittedPapers}</div>
                <div className="stat-label">Submitted Papers</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="stat-item">
                <div className="stat-number text-warning">{stats?.pendingReviews}</div>
                <div className="stat-label">Pending Reviews</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="stat-item">
                <div className="stat-number text-success">{stats?.activeCollaborations}</div>
                <div className="stat-label">Active Collaborations</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="stat-item">
                <div className="stat-number text-info">{stats?.profileViews}</div>
                <div className="stat-label">Profile Views</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-2 gap-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="grid gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.url}
                    className={`card ${action.isPrimary ? 'border-primary-blue' : ''}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="card-body">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{action.icon}</div>
                        <div>
                          <h4 className={`mb-1 ${action.isPrimary ? 'text-primary-blue' : ''}`}>
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-0">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">Recent Activity</h3>
            </div>
            <div className="card-body">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded">
                      <div className="text-xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <h5 className="mb-1">{activity.title}</h5>
                        <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        {activity.actionUrl && (
                          <Link 
                            to={activity.actionUrl} 
                            className="text-sm text-primary-blue mt-2 inline-block"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent activity to display.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completion Notice */}
        {(!user?.bio || !user?.specialization?.length) && (
          <div className="alert alert-info mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="mb-1">Complete Your Profile</h4>
                <p className="mb-0">
                  Add your bio and specializations to help other researchers find and connect with you.
                </p>
              </div>
              <Link to="/profile" className="btn btn-primary">
                Update Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;