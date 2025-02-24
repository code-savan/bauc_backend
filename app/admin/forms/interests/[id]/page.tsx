'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from "@/lib/utils";

interface Interest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  residential_address: string;
  country: string;
  state: string;
  city: string;
  address_landmark: string;
  occupation: string;
  investment_country: string;
  specific_city: string;
  specific_city_details: string;
  services_interested: string;
  services_other: string;
  property_type: string;
  property_type_other: string;
  budget_range: string;
  additional_features: string;
  timeline: string;
  how_did_you_hear: string;
  how_did_you_hear_other: string;
  additional_information: string;
  consent: boolean;
  created_at: string;
}

export default function InterestDetails({ params }: { params: { id: string } }) {
  const [interest, setInterest] = useState<Interest | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchInterest();
  }, []);

  const fetchInterest = async () => {
    try {
      const { data, error } = await supabase
        .from('expression_of_interests')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setInterest(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!interest) return <div>Interest not found</div>;

  const renderField = (label: string, value: string | boolean | null) => (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-gray-900">{value?.toString() || 'N/A'}</dd>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-100 p-6 md:p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expression of Interest Details</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted {formatDate(interest.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                <div className="space-y-4">
                  {renderField('Full Name', `${interest.first_name} ${interest.last_name}`)}
                  {renderField('Email', interest.email)}
                  {renderField('Phone', interest.phone)}
                  {renderField('Occupation', interest.occupation)}
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
                <div className="space-y-4">
                  {renderField('Country', interest.country)}
                  {renderField('State', interest.state)}
                  {renderField('City', interest.city)}
                  {renderField('Address', interest.residential_address)}
                  {renderField('Landmark', interest.address_landmark)}
                </div>
              </div>

              {/* Investment Preferences */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Investment Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('Investment Country', interest.investment_country)}
                  {renderField('Specific City', interest.specific_city)}
                  {renderField('City Details', interest.specific_city_details)}
                  {renderField('Services Interested', interest.services_interested)}
                  {interest.services_other && renderField('Other Services', interest.services_other)}
                  {renderField('Property Type', interest.property_type)}
                  {interest.property_type_other && renderField('Other Property Type', interest.property_type_other)}
                  {renderField('Budget Range', interest.budget_range)}
                  {renderField('Timeline', interest.timeline)}
                </div>
              </div>

              {/* Additional Information */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
                <div className="space-y-4">
                  {renderField('Additional Features', interest.additional_features)}
                  {renderField('How did you hear about us', interest.how_did_you_hear)}
                  {interest.how_did_you_hear_other && renderField('Other Source', interest.how_did_you_hear_other)}
                  {renderField('Additional Information', interest.additional_information)}
                  {renderField('Consent Given', interest.consent)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
