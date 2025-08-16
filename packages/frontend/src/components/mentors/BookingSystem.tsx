'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Calendar,
  Clock,
  DollarSign,
  Video,
  MessageCircle,
  User,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Shield,
  AlertTriangle,
  Star,
  Users,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingSystemProps {
  mentorId: string;
  onClose: () => void;
}

interface TimeSlot {
  id: string;
  datetime: string;
  available: boolean;
  price: number;
  duration: number;
  session_type: '1-on-1' | 'group' | 'workshop';
}

interface BookingDetails {
  mentor: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    rating: number;
    response_time: string;
  };
  session_type: '1-on-1' | 'group' | 'workshop';
  selected_slot: TimeSlot | null;
  agenda: string;
  questions: string;
  payment_method: 'card' | 'crypto' | 'credits';
  total_amount: number;
  currency: string;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({ mentorId, onClose }) => {
  const [currentStep, setCurrentStep] = useState<'select_session' | 'schedule' | 'details' | 'payment' | 'confirmation'>('select_session');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    mentor: {
      id: mentorId,
      name: 'Sarah Chen',
      title: 'Former VP Product at Stripe',
      avatar: '/api/placeholder/64/64',
      rating: 4.9,
      response_time: 'Within 2 hours'
    },
    session_type: '1-on-1',
    selected_slot: null,
    agenda: '',
    questions: '',
    payment_method: 'card',
    total_amount: 0,
    currency: 'USD'
  });

  const { user } = useAuth();

  // Mock available time slots
  const availableSlots: TimeSlot[] = [
    {
      id: 'slot_1',
      datetime: '2025-01-20T10:00:00Z',
      available: true,
      price: 250,
      duration: 60,
      session_type: '1-on-1'
    },
    {
      id: 'slot_2',
      datetime: '2025-01-20T14:00:00Z',
      available: true,
      price: 250,
      duration: 60,
      session_type: '1-on-1'
    },
    {
      id: 'slot_3',
      datetime: '2025-01-21T11:00:00Z',
      available: false,
      price: 250,
      duration: 60,
      session_type: '1-on-1'
    },
    {
      id: 'slot_4',
      datetime: '2025-01-21T15:00:00Z',
      available: true,
      price: 150,
      duration: 90,
      session_type: 'group'
    },
    {
      id: 'slot_5',
      datetime: '2025-01-22T13:00:00Z',
      available: true,
      price: 400,
      duration: 120,
      session_type: 'workshop'
    }
  ];

  const sessionTypes = [
    {
      type: '1-on-1' as const,
      title: '1-on-1 Mentoring',
      description: 'Personal guidance tailored to your specific needs',
      icon: <User className="w-6 h-6" />,
      price: 250,
      duration: 60,
      features: ['Personalized advice', 'Direct Q&A', 'Follow-up notes', 'Action items']
    },
    {
      type: 'group' as const,
      title: 'Group Session',
      description: 'Small group mentoring with other founders',
      icon: <Users className="w-6 h-6" />,
      price: 150,
      duration: 90,
      features: ['Peer learning', 'Group discussion', 'Shared experiences', 'Networking']
    },
    {
      type: 'workshop' as const,
      title: 'Workshop',
      description: 'Structured learning session with materials',
      icon: <BookOpen className="w-6 h-6" />,
      price: 400,
      duration: 120,
      features: ['Structured curriculum', 'Hands-on exercises', 'Resources included', 'Certificate']
    }
  ];

  const handleSessionTypeSelect = useCallback((sessionType: BookingDetails['session_type']) => {
    const selectedType = sessionTypes.find(t => t.type === sessionType)!;
    setBookingDetails(prev => ({
      ...prev,
      session_type: sessionType,
      total_amount: selectedType.price,
      currency: 'USD'
    }));
    setCurrentStep('schedule');
  }, []);

  const handleSlotSelect = useCallback((slot: TimeSlot) => {
    setBookingDetails(prev => ({
      ...prev,
      selected_slot: slot,
      total_amount: slot.price
    }));
    setCurrentStep('details');
  }, []);

  const handleBookingComplete = useCallback(async () => {
    try {
      // Mock API call to complete booking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('confirmation');
      toast.success('Session booked successfully!');
    } catch (error) {
      toast.error('Failed to book session. Please try again.');
    }
  }, []);

  const renderSessionSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Session Type</h2>
        <p className="text-gray-400">Select the type of mentoring session you'd prefer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sessionTypes.map((session) => (
          <button
            key={session.type}
            onClick={() => handleSessionTypeSelect(session.type)}
            className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-blue-400">{session.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-white">{session.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  {session.duration} minutes
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">{session.description}</p>
            
            <div className="mb-4">
              <div className="text-2xl font-bold text-green-400 mb-2">
                ${session.price}
              </div>
              <ul className="space-y-1">
                {session.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderScheduleSelection = () => {
    const filteredSlots = availableSlots.filter(slot => slot.session_type === bookingDetails.session_type);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep('select_session')}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to session types
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Select Time Slot</h2>
          <p className="text-gray-400">
            Choose from {bookingDetails.mentor.name}'s available {bookingDetails.session_type} sessions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map((slot) => {
            const date = new Date(slot.datetime);
            const isAvailable = slot.available;
            
            return (
              <button
                key={slot.id}
                onClick={() => isAvailable && handleSlotSelect(slot)}
                disabled={!isAvailable}
                className={`p-4 rounded-lg border transition-all ${
                  isAvailable
                    ? 'border-gray-700 hover:border-blue-500/50 bg-gray-800/50'
                    : 'border-gray-800 bg-gray-800/20 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-blue-400 mb-2">
                    {date.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {slot.duration} minutes
                  </div>
                  <div className="text-green-400 font-bold">
                    ${slot.price}
                  </div>
                  {!isAvailable && (
                    <div className="text-red-400 text-xs mt-1">Unavailable</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filteredSlots.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Available Slots</h3>
            <p className="text-sm text-gray-500">
              No {bookingDetails.session_type} sessions available. Try a different session type.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep('schedule')}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to schedule
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Session Details</h2>
        <p className="text-gray-400">Provide information about what you'd like to discuss</p>
      </div>

      {/* Session Summary */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Session Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <div className="font-medium text-white">{bookingDetails.mentor.name}</div>
                <div className="text-sm text-gray-400">{bookingDetails.mentor.title}</div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400">{bookingDetails.mentor.rating}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Session Type:</span>
              <span className="text-white capitalize">{bookingDetails.session_type.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date & Time:</span>
              <span className="text-white">
                {bookingDetails.selected_slot && 
                  new Date(bookingDetails.selected_slot.datetime).toLocaleString()
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="text-white">{bookingDetails.selected_slot?.duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price:</span>
              <span className="text-green-400 font-bold">
                ${bookingDetails.total_amount} {bookingDetails.currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Details Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="agenda">What would you like to focus on? *</Label>
          <Textarea
            id="agenda"
            value={bookingDetails.agenda}
            onChange={(e) => setBookingDetails(prev => ({ ...prev, agenda: e.target.value }))}
            placeholder="e.g., Product-market fit strategy, fundraising preparation, team building..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="questions">Specific questions or challenges (optional)</Label>
          <Textarea
            id="questions"
            value={bookingDetails.questions}
            onChange={(e) => setBookingDetails(prev => ({ ...prev, questions: e.target.value }))}
            placeholder="Any specific questions you'd like to discuss..."
            rows={3}
            className="mt-1"
          />
        </div>

        <Button
          onClick={() => setCurrentStep('payment')}
          disabled={!bookingDetails.agenda.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Continue to Payment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep('details')}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to details
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Payment</h2>
        <p className="text-gray-400">Secure payment powered by blockchain escrow</p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Session with {bookingDetails.mentor.name}</span>
            <span className="text-white">${bookingDetails.total_amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Platform fee</span>
            <span className="text-white">$0</span>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <div className="flex justify-between">
              <span className="font-bold text-white">Total</span>
              <span className="font-bold text-green-400">
                ${bookingDetails.total_amount} {bookingDetails.currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <Label>Payment Method</Label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setBookingDetails(prev => ({ ...prev, payment_method: 'card' }))}
            className={`p-4 rounded-lg border transition-all ${
              bookingDetails.payment_method === 'card'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/30'
            }`}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="text-white font-medium">Credit Card</div>
            <div className="text-xs text-gray-400">Visa, Mastercard, Amex</div>
          </button>

          <button
            onClick={() => setBookingDetails(prev => ({ ...prev, payment_method: 'crypto' }))}
            className={`p-4 rounded-lg border transition-all ${
              bookingDetails.payment_method === 'crypto'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/30'
            }`}
          >
            <Shield className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <div className="text-white font-medium">Crypto</div>
            <div className="text-xs text-gray-400">SOL, USDC</div>
          </button>

          <button
            onClick={() => setBookingDetails(prev => ({ ...prev, payment_method: 'credits' }))}
            className={`p-4 rounded-lg border transition-all ${
              bookingDetails.payment_method === 'credits'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/30'
            }`}
          >
            <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="text-white font-medium">Platform Credits</div>
            <div className="text-xs text-gray-400">Balance: $150</div>
          </button>
        </div>

        {bookingDetails.payment_method === 'card' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingZip">Billing ZIP</Label>
                <Input
                  id="billingZip"
                  placeholder="12345"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {bookingDetails.payment_method === 'crypto' && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-purple-400">Blockchain Escrow</span>
            </div>
            <p className="text-sm text-gray-300">
              Payment will be held in a secure escrow contract and released to the mentor 
              after successful session completion.
            </p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="font-medium text-green-400">Secure Payment</span>
        </div>
        <p className="text-sm text-gray-300">
          All payments are processed securely. Sessions are backed by our satisfaction guarantee.
        </p>
      </div>

      <Button
        onClick={handleBookingComplete}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Complete Booking (${bookingDetails.total_amount})
      </Button>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Session Booked!</h2>
        <p className="text-gray-400">
          Your mentoring session has been successfully booked
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 text-left">
        <h3 className="text-lg font-bold text-white mb-4">Session Details</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Mentor:</span>
            <span className="text-white">{bookingDetails.mentor.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date & Time:</span>
            <span className="text-white">
              {bookingDetails.selected_slot && 
                new Date(bookingDetails.selected_slot.datetime).toLocaleString()
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Duration:</span>
            <span className="text-white">{bookingDetails.selected_slot?.duration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Meeting Link:</span>
            <span className="text-blue-400">Will be sent 15 minutes before</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-400">
          {bookingDetails.mentor.name} will reach out within {bookingDetails.mentor.response_time} 
          to confirm the session and share any preparation materials.
        </p>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message Mentor
          </Button>
          
          <Button variant="outline" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Add to Calendar
          </Button>
        </div>
      </div>

      <Button onClick={onClose} className="w-full">
        Done
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Book Mentoring Session</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {['select_session', 'schedule', 'details', 'payment', 'confirmation'].map((step, index) => {
              const isActive = step === currentStep;
              const isCompleted = ['select_session', 'schedule', 'details', 'payment', 'confirmation'].indexOf(currentStep) > index;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500' :
                    isActive ? 'bg-blue-500' : 'bg-gray-700'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white text-sm">{index + 1}</span>
                    )}
                  </div>
                  {index < 4 && (
                    <div className={`w-16 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {currentStep === 'select_session' && renderSessionSelection()}
          {currentStep === 'schedule' && renderScheduleSelection()}
          {currentStep === 'details' && renderBookingDetails()}
          {currentStep === 'payment' && renderPayment()}
          {currentStep === 'confirmation' && renderConfirmation()}
        </div>
      </div>
    </div>
  );
};