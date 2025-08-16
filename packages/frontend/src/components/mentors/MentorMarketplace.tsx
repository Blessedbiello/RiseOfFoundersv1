'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  Users,
  Award,
  Calendar,
  Video,
  MessageCircle,
  CheckCircle,
  MapPin,
  Globe,
  Link,
  Twitter,
  ExternalLink,
  BookOpen,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  bio: string;
  location: string;
  timezone: string;
  languages: string[];
  expertise: Array<{
    area: string;
    level: 'intermediate' | 'advanced' | 'expert';
    years: number;
  }>;
  experience: {
    total_years: number;
    companies: string[];
    exits: number;
    investments: number;
    mentees_helped: number;
  };
  pricing: {
    hourly_rate: number;
    currency: 'USD' | 'SOL' | 'USDC';
    session_types: Array<{
      type: '1-on-1' | 'group' | 'workshop';
      duration: number;
      price: number;
      description: string;
    }>;
  };
  availability: {
    weekly_hours: number;
    preferred_times: string[];
    booking_lead_time: number; // days
    max_sessions_per_week: number;
  };
  reviews: {
    average_rating: number;
    total_reviews: number;
    recent_reviews: Array<{
      id: string;
      founder_name: string;
      rating: number;
      comment: string;
      date: string;
      session_type: string;
    }>;
  };
  verification: {
    identity_verified: boolean;
    linkedin_verified: boolean;
    company_verified: boolean;
    background_checked: boolean;
  };
  social: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    calendar_link?: string;
  };
  featured: boolean;
  response_time: string; // e.g., "Within 2 hours"
  success_rate: number; // percentage
  tags: string[];
}

const expertiseAreas = [
  { id: 'fundraising', label: 'Fundraising', icon: '💰' },
  { id: 'product', label: 'Product Strategy', icon: '📱' },
  { id: 'marketing', label: 'Marketing & Growth', icon: '📈' },
  { id: 'operations', label: 'Operations', icon: '⚙️' },
  { id: 'leadership', label: 'Leadership', icon: '👥' },
  { id: 'sales', label: 'Sales Strategy', icon: '🎯' },
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'legal', label: 'Legal & Compliance', icon: '⚖️' },
  { id: 'finance', label: 'Finance & Accounting', icon: '📊' },
  { id: 'hr', label: 'HR & Talent', icon: '👤' }
];

const sessionTypes = [
  { id: '1-on-1', label: '1-on-1 Mentoring', icon: '👤', description: 'Personal guidance and advice' },
  { id: 'group', label: 'Group Sessions', icon: '👥', description: 'Small group mentoring' },
  { id: 'workshop', label: 'Workshops', icon: '🎓', description: 'Structured learning sessions' }
];

export const MentorMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedSessionType, setSelectedSessionType] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'experience'>('rating');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  const { user } = useAuth();

  // Mock mentor data
  const mockMentors: Mentor[] = [
    {
      id: 'mentor_1',
      name: 'Sarah Chen',
      title: 'Former VP Product at Stripe',
      company: 'Stripe → Angel Investor',
      avatar: '/api/placeholder/64/64',
      bio: 'Former VP of Product at Stripe with 12+ years in fintech. Helped build products used by millions. Now angel investor and mentor helping founders navigate product-market fit and scale.',
      location: 'San Francisco, CA',
      timezone: 'PST',
      languages: ['English', 'Mandarin'],
      expertise: [
        { area: 'product', level: 'expert', years: 12 },
        { area: 'fundraising', level: 'advanced', years: 8 },
        { area: 'leadership', level: 'expert', years: 10 }
      ],
      experience: {
        total_years: 15,
        companies: ['Stripe', 'Google', 'Y Combinator'],
        exits: 2,
        investments: 45,
        mentees_helped: 120
      },
      pricing: {
        hourly_rate: 250,
        currency: 'USD',
        session_types: [
          { type: '1-on-1', duration: 60, price: 250, description: 'Deep dive product strategy session' },
          { type: 'group', duration: 90, price: 150, description: 'Small group product workshop' },
          { type: 'workshop', duration: 120, price: 400, description: 'Product-market fit masterclass' }
        ]
      },
      availability: {
        weekly_hours: 10,
        preferred_times: ['9 AM - 12 PM PST', '2 PM - 5 PM PST'],
        booking_lead_time: 3,
        max_sessions_per_week: 8
      },
      reviews: {
        average_rating: 4.9,
        total_reviews: 47,
        recent_reviews: [
          {
            id: 'review_1',
            founder_name: 'Alex M.',
            rating: 5,
            comment: 'Sarah provided incredible insights on our product strategy. Her experience at Stripe really shows.',
            date: '2025-01-10T00:00:00Z',
            session_type: '1-on-1'
          },
          {
            id: 'review_2',
            founder_name: 'Maria S.',
            rating: 5,
            comment: 'Extremely helpful for fundraising preparation. Got us ready for our Series A.',
            date: '2025-01-08T00:00:00Z',
            session_type: '1-on-1'
          }
        ]
      },
      verification: {
        identity_verified: true,
        linkedin_verified: true,
        company_verified: true,
        background_checked: true
      },
      social: {
        linkedin: 'https://linkedin.com/in/sarahchen',
        twitter: 'https://twitter.com/sarahchen',
        website: 'https://sarahchen.com'
      },
      featured: true,
      response_time: 'Within 2 hours',
      success_rate: 96,
      tags: ['Fintech', 'Product Strategy', 'Stripe Alumni', 'Angel Investor']
    },
    {
      id: 'mentor_2',
      name: 'Marcus Rodriguez',
      title: 'Serial Entrepreneur & VC Partner',
      company: 'Andreessen Horowitz',
      avatar: '/api/placeholder/64/64',
      bio: 'Built and sold 3 companies, including a $200M exit to Adobe. Now partner at a16z focusing on early-stage B2B startups. Passionate about helping founders avoid common pitfalls.',
      location: 'Austin, TX',
      timezone: 'CST',
      languages: ['English', 'Spanish'],
      expertise: [
        { area: 'fundraising', level: 'expert', years: 15 },
        { area: 'operations', level: 'expert', years: 12 },
        { area: 'leadership', level: 'expert', years: 14 }
      ],
      experience: {
        total_years: 18,
        companies: ['Andreessen Horowitz', 'Adobe', 'TechStars'],
        exits: 3,
        investments: 78,
        mentees_helped: 200
      },
      pricing: {
        hourly_rate: 300,
        currency: 'USD',
        session_types: [
          { type: '1-on-1', duration: 45, price: 225, description: 'Fundraising and strategy consultation' },
          { type: 'group', duration: 90, price: 180, description: 'Entrepreneur roundtable discussion' },
          { type: 'workshop', duration: 180, price: 600, description: 'Fundraising bootcamp intensive' }
        ]
      },
      availability: {
        weekly_hours: 8,
        preferred_times: ['10 AM - 1 PM CST', '3 PM - 6 PM CST'],
        booking_lead_time: 5,
        max_sessions_per_week: 6
      },
      reviews: {
        average_rating: 4.8,
        total_reviews: 63,
        recent_reviews: [
          {
            id: 'review_3',
            founder_name: 'Jennifer L.',
            rating: 5,
            comment: 'Marcus helped us close our seed round. His network and advice were invaluable.',
            date: '2025-01-12T00:00:00Z',
            session_type: '1-on-1'
          }
        ]
      },
      verification: {
        identity_verified: true,
        linkedin_verified: true,
        company_verified: true,
        background_checked: true
      },
      social: {
        linkedin: 'https://linkedin.com/in/marcusrodriguez',
        twitter: 'https://twitter.com/marcusrod'
      },
      featured: true,
      response_time: 'Within 4 hours',
      success_rate: 94,
      tags: ['Serial Entrepreneur', 'VC Partner', 'B2B Expert', 'Exits']
    },
    {
      id: 'mentor_3',
      name: 'Dr. Lisa Wang',
      title: 'Former Head of AI at Tesla',
      company: 'Tesla → AI Consultant',
      avatar: '/api/placeholder/64/64',
      bio: 'Led AI initiatives at Tesla for autonomous driving. PhD in Machine Learning from Stanford. Now helping AI startups with technical strategy and team building.',
      location: 'Palo Alto, CA',
      timezone: 'PST',
      languages: ['English', 'Mandarin', 'German'],
      expertise: [
        { area: 'technology', level: 'expert', years: 10 },
        { area: 'leadership', level: 'advanced', years: 8 },
        { area: 'product', level: 'advanced', years: 6 }
      ],
      experience: {
        total_years: 12,
        companies: ['Tesla', 'Google DeepMind', 'Stanford'],
        exits: 1,
        investments: 15,
        mentees_helped: 85
      },
      pricing: {
        hourly_rate: 200,
        currency: 'USD',
        session_types: [
          { type: '1-on-1', duration: 60, price: 200, description: 'Technical strategy and AI roadmap' },
          { type: 'group', duration: 120, price: 120, description: 'AI technical workshop' }
        ]
      },
      availability: {
        weekly_hours: 12,
        preferred_times: ['11 AM - 2 PM PST', '4 PM - 7 PM PST'],
        booking_lead_time: 2,
        max_sessions_per_week: 10
      },
      reviews: {
        average_rating: 4.7,
        total_reviews: 34,
        recent_reviews: [
          {
            id: 'review_4',
            founder_name: 'David K.',
            rating: 5,
            comment: 'Lisa helped us build our AI roadmap from scratch. Incredible technical depth.',
            date: '2025-01-11T00:00:00Z',
            session_type: '1-on-1'
          }
        ]
      },
      verification: {
        identity_verified: true,
        linkedin_verified: true,
        company_verified: true,
        background_checked: false
      },
      social: {
        linkedin: 'https://linkedin.com/in/drlisawang',
        website: 'https://lisawang.ai'
      },
      featured: false,
      response_time: 'Within 1 hour',
      success_rate: 92,
      tags: ['AI Expert', 'Tesla Alumni', 'PhD', 'Technical Strategy']
    }
  ];

  const filteredMentors = useMemo(() => {
    let filtered = mockMentors.filter(mentor => {
      const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           mentor.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesExpertise = selectedExpertise === 'all' || 
                              mentor.expertise.some(exp => exp.area === selectedExpertise);
      
      const matchesSessionType = selectedSessionType === 'all' ||
                                mentor.pricing.session_types.some(session => session.type === selectedSessionType);
      
      const matchesPrice = mentor.pricing.hourly_rate >= priceRange[0] && 
                          mentor.pricing.hourly_rate <= priceRange[1];
      
      const matchesFeatured = !showFeaturedOnly || mentor.featured;
      
      return matchesSearch && matchesExpertise && matchesSessionType && matchesPrice && matchesFeatured;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.reviews.average_rating - a.reviews.average_rating;
        case 'price_low':
          return a.pricing.hourly_rate - b.pricing.hourly_rate;
        case 'price_high':
          return b.pricing.hourly_rate - a.pricing.hourly_rate;
        case 'experience':
          return b.experience.total_years - a.experience.total_years;
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockMentors, searchQuery, selectedExpertise, selectedSessionType, priceRange, sortBy, showFeaturedOnly]);

  const handleBookSession = useCallback((mentorId: string, sessionType: string) => {
    // In production, this would navigate to booking flow
    toast.success('Booking system coming soon!');
  }, []);

  const renderMentorCard = (mentor: Mentor) => (
    <div
      key={mentor.id}
      className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg p-6 hover:border-blue-500/50 transition-all ${
        mentor.featured 
          ? 'border-yellow-500/30 shadow-lg shadow-yellow-500/10' 
          : 'border-white/10'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{mentor.name}</h3>
                {mentor.verification.identity_verified && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {mentor.featured && (
                  <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                    Featured
                  </div>
                )}
              </div>
              <p className="text-sm text-blue-400 font-medium">{mentor.title}</p>
              <p className="text-sm text-gray-400">{mentor.company}</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                ${mentor.pricing.hourly_rate}
              </div>
              <div className="text-xs text-gray-400">per hour</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{mentor.reviews.average_rating}</span>
              <span>({mentor.reviews.total_reviews})</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{mentor.location}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{mentor.response_time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{mentor.bio}</p>

      {/* Expertise */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-white mb-2">Expertise</h4>
        <div className="flex flex-wrap gap-2">
          {mentor.expertise.slice(0, 3).map((exp) => {
            const area = expertiseAreas.find(a => a.id === exp.area);
            return (
              <div
                key={exp.area}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded text-xs"
              >
                <span>{area?.icon}</span>
                <span className="text-gray-300">{area?.label}</span>
                <span className="text-blue-400">({exp.years}y)</span>
              </div>
            );
          })}
          {mentor.expertise.length > 3 && (
            <div className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-400">
              +{mentor.expertise.length - 3} more
            </div>
          )}
        </div>
      </div>

      {/* Experience Highlights */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <div className="text-lg font-bold text-blue-400">{mentor.experience.total_years}</div>
          <div className="text-xs text-gray-400">Years Exp</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-400">{mentor.experience.mentees_helped}</div>
          <div className="text-xs text-gray-400">Mentees</div>
        </div>
        <div>
          <div className="text-lg font-bold text-purple-400">{mentor.success_rate}%</div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
      </div>

      {/* Session Types */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-white mb-2">Available Sessions</h4>
        <div className="space-y-2">
          {mentor.pricing.session_types.map((session) => {
            const sessionTypeInfo = sessionTypes.find(t => t.id === session.type);
            return (
              <div key={session.type} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                <div className="flex items-center gap-2">
                  {sessionTypeInfo?.icon === '👤' && <Users className="w-4 h-4 text-blue-400" />}
                  {sessionTypeInfo?.icon === '👥' && <Users className="w-4 h-4 text-green-400" />}
                  {sessionTypeInfo?.icon === '🎓' && <BookOpen className="w-4 h-4 text-purple-400" />}
                  <div>
                    <span className="text-white text-sm font-medium">{sessionTypeInfo?.label}</span>
                    <div className="text-xs text-gray-400">{session.duration} min</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">${session.price}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Review */}
      {mentor.reviews.recent_reviews.length > 0 && (
        <div className="mb-4 p-3 bg-gray-700/20 rounded">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < mentor.reviews.recent_reviews[0].rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-500'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              by {mentor.reviews.recent_reviews[0].founder_name}
            </span>
          </div>
          <p className="text-xs text-gray-300 line-clamp-2">
            "{mentor.reviews.recent_reviews[0].comment}"
          </p>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {mentor.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
        
        <Button
          onClick={() => handleBookSession(mentor.id, '1-on-1')}
          size="sm"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book Session
        </Button>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
        {mentor.social.linkedin && (
          <a
            href={mentor.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400"
          >
            <Link className="w-4 h-4" />
          </a>
        )}
        {mentor.social.twitter && (
          <a
            href={mentor.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400"
          >
            <Twitter className="w-4 h-4" />
          </a>
        )}
        {mentor.social.website && (
          <a
            href={mentor.social.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        
        <div className="ml-auto text-xs text-gray-500">
          {mentor.availability.weekly_hours}h/week available
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Mentor Marketplace</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect with experienced founders, investors, and industry experts 
            to accelerate your startup journey
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Expertise Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Expertise</option>
                {expertiseAreas.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.icon} {area.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Type Filter */}
            <select
              value={selectedSessionType}
              onChange={(e) => setSelectedSessionType(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Session Types</option>
              {sessionTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="rating">Highest Rated</option>
              <option value="price_low">Lowest Price</option>
              <option value="price_high">Highest Price</option>
              <option value="experience">Most Experience</option>
            </select>
          </div>

          {/* Price Range and Featured Toggle */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Label>Price Range:</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">${priceRange[0]}</span>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="25"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="flex-1 max-w-32"
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="25"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="flex-1 max-w-32"
                />
                <span className="text-sm text-gray-400">${priceRange[1]}</span>
              </div>
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Featured only</span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedExpertise !== 'all' && ` in ${expertiseAreas.find(a => a.id === selectedExpertise)?.label}`}
          </p>
        </div>

        {/* Mentor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMentors.map(renderMentorCard)}
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Mentors Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your search filters to find more mentors
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedExpertise('all');
              setSelectedSessionType('all');
              setPriceRange([0, 500]);
              setShowFeaturedOnly(false);
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredMentors.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Load More Mentors
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};