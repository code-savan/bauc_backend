'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe2, Languages, Mail, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { detectLanguage, translateText } from '@/lib/translation';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TranslatableContent {
  original: string;
  translated?: string;
  language?: string;
  isTranslating?: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  subject: string;
  message: string;
  reply?: string;
  created_at: string;
}

export default function ContactDetails({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<TranslatableContent>({ original: '' });
  const [messageTranslation, setMessageTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContact();
  }, []);

  useEffect(() => {
    if (contact) {
      detectAndSetLanguage();
    }
  }, [contact]);

  const detectAndSetLanguage = async () => {
    try {
      // Detect language for subject
      const subjectLang = await detectLanguage(contact?.subject || '');
      setSubject({
        original: contact?.subject || '',
        language: subjectLang
      });

      // Detect language for message
      const messageLang = await detectLanguage(contact?.message || '');
      setMessageTranslation(contact?.message || '');
    } catch (error) {
      console.error('Language detection error:', error);
    }
  };

  const handleTranslateMessage = async () => {
    if (!contact) return;

    setIsTranslating(true);
    try {
      const translated = await translateText(contact.message, 'en');
      setMessageTranslation(translated);
      toast({
        title: "Translation Complete",
        description: "Message has been translated to English",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Translation Failed",
        description: "Could not translate the message. Please try again.",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const fetchContact = async () => {
    try {
      const { data, error } = await supabase
        .from('contactform')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setContact(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !contact) return;

    setIsSending(true);
    try {
      // Send email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contact.email || '',
          subject: `Re: ${contact.subject || ''}`,
          content: replyContent,
        }),
      });

      // Update contact with reply in database
      const { error } = await supabase
        .from('contactform')
        .update({ reply: replyContent })
        .eq('id', contact.id);

      if (error) throw error;

      // Update local state
      setContact((prev) => ({
        ...prev,
        reply: replyContent,
        id: prev?.id || '',
        name: prev?.name || '',
        email: prev?.email || '',
        phone: prev?.phone || '',
        country: prev?.country || '',
        subject: prev?.subject || '',
        message: prev?.message || '',
        created_at: prev?.created_at || '',
      }));

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent and saved successfully.",
      });
      setReplyContent('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reply. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="loader">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </div>;
  }

  if (!contact) return <div>Contact not found</div>;

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
                <h1 className="text-2xl font-bold text-gray-900">Contact Details</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted {formatDate(contact.created_at)}
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Reply
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Reply to {contact.name}</DialogTitle>
                    <DialogDescription>
                      Send a response to {contact.email}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Original Message
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                        {contact.message}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Your Reply
                      </label>
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your reply here..."
                        className="mt-1"
                        rows={6}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setReplyContent('')}
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyContent.trim() || isSending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSending ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Name and Email */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-gray-900">{contact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-gray-900">{contact.email}</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Phone and Country */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-gray-900">{contact.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Country</label>
                    <p className="mt-1 text-gray-900">{contact.country || 'Nigeria'}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                  {subject.language && subject.language !== 'en' && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Globe2 className="h-3 w-3" />
                        {subject.language.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTranslateMessage()}
                        disabled={isTranslating}
                        className="h-6 px-2 text-xs"
                      >
                        {isTranslating ? 'Translating...' : 'Translate to English'}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 text-gray-900">
                  {subject.translated || subject.original}
                </div>
              </div>

              {/* Message */}
              <div className="col-span-full bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Message</h3>
                  {!messageTranslation && (
                    <Button
                      onClick={handleTranslateMessage}
                      disabled={isTranslating}
                      variant="outline"
                      size="sm"
                    >
                      {isTranslating ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Translating...
                        </>
                      ) : (
                        <>
                          <Globe2 className="h-4 w-4 mr-2" />
                          Translate to English
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      Original Message
                    </div>
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {contact?.message}
                    </div>
                  </div>

                  {/* Translated Message */}
                  {/* {messageTranslation && (
                    <div className="bg-white rounded-lg p-4 border-2 border-primary/10">
                      <div className="text-sm font-medium text-gray-500 mb-2">
                        English Translation
                      </div>
                      <div className="text-gray-900 whitespace-pre-wrap">
                        {messageTranslation}
                      </div>
                    </div>
                  )} */}
                </div>
              </div>

              {/* Previous Reply */}
              {contact.reply && (
                <div className="col-span-full bg-gray-50 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Previous Reply</h3>
                  <div className="bg-white rounded-lg p-4 whitespace-pre-wrap text-gray-900">
                    {contact.reply}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
