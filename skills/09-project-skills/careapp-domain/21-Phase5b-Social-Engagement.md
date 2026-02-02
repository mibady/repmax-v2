# Social Engagement & Isolation Prevention PRP - Caregiving Companion

## Goal

Build a comprehensive social engagement system that combats loneliness in elderly care recipients through meaningful conversations, social activity scheduling, memory sharing, community connections, and family interaction facilitation.

## Why

- Social isolation increases mortality risk by 26-32% in elderly populations
- Loneliness is linked to cognitive decline, depression, and physical health problems
- Regular social interaction improves mood, memory, and overall well-being
- Many elderly lose social connections due to mobility or health limitations
- Technology can bridge the gap between physical isolation and social connection

## What (User-Visible Behavior)

- **Daily Social Chat**: Extended conversations beyond task-based interactions
- **Memory Lane**: Prompts to share life stories and memories
- **Activity Suggestions**: Personalized social activities based on interests
- **Virtual Gatherings**: Video calls with family and friends
- **Community Events**: Local senior activities and programs
- **Hobby Groups**: Connect with others sharing similar interests
- **Intergenerational Connections**: Programs linking seniors with younger volunteers
- **Mood Boost Content**: Jokes, music, and uplifting content

## All Needed Context

### Documentation References

- UCLA Loneliness Scale: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2394670/
- Social Engagement Research: https://www.nia.nih.gov/news/social-isolation-loneliness-older-people
- Reminiscence Therapy: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6094068/
- Virtual Social Programs: https://www.aarp.org/home-family/friends-family/info-2020/isolation-survey-older-adults.html

### Package Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.350.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-player": "^2.16.0",
    "socket.io-client": "^4.7.5"
  }
}
```

### Critical Implementation Notes

#### Engagement Strategies

- **Personalization**:
  - Learn interests through initial assessment
  - Adapt conversation topics based on responses
  - Remember previous conversations for continuity
  - Match personality styles (formal vs casual)

#### Content Curation

- **Age-Appropriate**:
  - Classic music from their era
  - Historical events they lived through
  - Cultural references they understand
  - Avoid infantilizing content

#### Privacy & Dignity

- **Respectful Interaction**:
  - Always maintain adult conversation level
  - Respect boundaries and preferences
  - Allow opt-out from any activity
  - Protect shared memories and stories

## Implementation Blueprint

### 1. Social Engagement Dashboard (/app/social/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Heart, MessageCircle, Music, Calendar, Smile } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyChat } from '@/components/social/DailyChat';
import { MemoryLane } from '@/components/social/MemoryLane';
import { ActivitySuggestions } from '@/components/social/ActivitySuggestions';
import { VirtualGatherings } from '@/components/social/VirtualGatherings';
import { MoodBooster } from '@/components/social/MoodBooster';

interface SocialMetrics {
  engagementScore: number; // 0-100
  lastSocialInteraction: Date;
  weeklyInteractionMinutes: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  favoriteTopics: string[];
  connectionStrength: {
    family: number;
    friends: number;
    community: number;
  };
}

export default function SocialEngagementPage() {
  const [activeChat, setActiveChat] = useState(false);

  const { data: metrics } = useQuery({
    queryKey: ['social-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/social/metrics');
      return response.json();
    },
  });

  const { data: todaysPrompt } = useQuery({
    queryKey: ['daily-prompt'],
    queryFn: async () => {
      const response = await fetch('/api/social/daily-prompt');
      return response.json();
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Social Connection Hub
        </h1>
        <p className="text-gray-600">
          Stay connected, share memories, and enjoy meaningful interactions
        </p>
      </div>

      {/* Engagement Score */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Social Wellness Score</h3>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-blue-600">
                  {metrics?.engagementScore || 0}/100
                </div>
                <div className="text-sm text-gray-600">
                  <p>Last interaction: {metrics?.lastSocialInteraction
                    ? new Date(metrics.lastSocialInteraction).toRelativeTime()
                    : 'Start a conversation!'}</p>
                  <p>This week: {metrics?.weeklyInteractionMinutes || 0} minutes of connection</p>
                </div>
              </div>
            </div>
            <Button size="lg" onClick={() => setActiveChat(true)}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Daily Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Conversation Starter */}
      {todaysPrompt && (
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900">Today's Conversation Starter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-800 text-lg mb-4">{todaysPrompt.question}</p>
            <Button variant="outline" onClick={() => setActiveChat(true)}>
              Share Your Story
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="memories">Memories</TabsTrigger>
          <TabsTrigger value="gatherings">Gatherings</TabsTrigger>
          <TabsTrigger value="mood">Mood Boost</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <ActivitySuggestions interests={metrics?.favoriteTopics} />
        </TabsContent>

        <TabsContent value="memories">
          <MemoryLane />
        </TabsContent>

        <TabsContent value="gatherings">
          <VirtualGatherings />
        </TabsContent>

        <TabsContent value="mood">
          <MoodBooster />
        </TabsContent>

        <TabsContent value="community">
          <CommunityEvents />
        </TabsContent>
      </Tabs>

      {/* Active Chat Modal */}
      {activeChat && (
        <DailyChat onClose={() => setActiveChat(false)} />
      )}
    </div>
  );
}
```

### 2. Memory Lane Component (/components/social/MemoryLane.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Camera, Heart, Clock, Share2, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Memory {
  id: string;
  category: 'childhood' | 'family' | 'career' | 'travel' | 'milestone' | 'daily';
  prompt: string;
  response?: string;
  audioUrl?: string;
  photoUrl?: string;
  sharedWith: string[];
  createdAt: Date;
  reactions: {
    userId: string;
    type: 'love' | 'laugh' | 'wow';
  }[];
}

const memoryPrompts = {
  childhood: [
    "What was your favorite game to play as a child?",
    "Tell me about your best friend growing up.",
    "What was Sunday dinner like in your family?",
    "What was your favorite subject in school?",
  ],
  family: [
    "How did you meet your spouse?",
    "What's your favorite memory with your children?",
    "Tell me about a family tradition you loved.",
    "What advice did your parents give you?",
  ],
  career: [
    "What was your first job?",
    "What accomplishment are you most proud of?",
    "Who was your favorite colleague?",
    "What would you tell someone starting in your field?",
  ],
  travel: [
    "What's the most beautiful place you've visited?",
    "Tell me about a memorable trip.",
    "Where would you love to visit again?",
    "What's the farthest you've traveled from home?",
  ],
  milestone: [
    "What was your wedding day like?",
    "Tell me about the day your first child was born.",
    "What was your proudest moment?",
    "What birthday celebration do you remember most?",
  ],
};

export function MemoryLane() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof memoryPrompts>('childhood');
  const [isRecording, setIsRecording] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const { data: memories } = useQuery({
    queryKey: ['memories'],
    queryFn: async () => {
      const response = await fetch('/api/social/memories');
      return response.json();
    },
  });

  const recordMemory = useMutation({
    mutationFn: async (memoryData: Partial<Memory>) => {
      const response = await fetch('/api/social/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memoryData),
      });
      return response.json();
    },
  });

  const getRandomPrompt = (category: keyof typeof memoryPrompts) => {
    const prompts = memoryPrompts[category];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const startMemoryCapture = () => {
    const prompt = getRandomPrompt(selectedCategory);
    setCurrentPrompt(prompt);

    // Use Sarah AI to ask the question via voice
    fetch('/api/voice/ask-memory-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    setIsRecording(true);
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose a Memory Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.keys(memoryPrompts).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category as keyof typeof memoryPrompts)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Prompt */}
      {currentPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <p className="text-lg font-medium text-blue-900 mb-4">{currentPrompt}</p>
              <div className="flex gap-3">
                <Button
                  variant={isRecording ? 'destructive' : 'default'}
                  onClick={() => isRecording ? setIsRecording(false) : startMemoryCapture()}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {isRecording ? 'Stop Recording' : 'Record Answer'}
                </Button>
                <Button variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Memory Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {memories?.map((memory: Memory) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary">{memory.category}</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(memory.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{memory.prompt}</p>

                  {memory.response && (
                    <p className="text-gray-900 mb-3">{memory.response}</p>
                  )}

                  {memory.photoUrl && (
                    <img
                      src={memory.photoUrl}
                      alt="Memory"
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {memory.reactions.map((reaction, i) => (
                        <span key={i} className="text-sm">
                          {reaction.type === 'love' ? '❤️' :
                           reaction.type === 'laugh' ? '😄' : '✨'}
                        </span>
                      ))}
                    </div>

                    <Button size="sm" variant="ghost">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {(!memories || memories.length === 0) && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No memories captured yet</p>
              <Button
                className="mt-4"
                onClick={startMemoryCapture}
              >
                Capture Your First Memory
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Daily Social Chat Component (/components/social/DailyChat.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Smile, Heart, Music, Book } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ChatProps {
  onClose: () => void;
}

export function DailyChat({ onClose }: ChatProps) {
  const [chatStage, setChatStage] = useState<'greeting' | 'topic' | 'conversation' | 'closing'>('greeting');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'sarah' | 'user', text: string}>>([]);

  const topics = [
    { id: 'memories', label: 'Share Memories', icon: Heart },
    { id: 'current', label: 'Current Events', icon: Book },
    { id: 'jokes', label: 'Jokes & Humor', icon: Smile },
    { id: 'music', label: 'Music & Entertainment', icon: Music },
  ];

  useEffect(() => {
    // Initial greeting from Sarah
    setMessages([{
      role: 'sarah',
      text: "Hello! I'm so glad we can chat today. How are you feeling?"
    }]);
  }, []);

  const handleTopicSelection = (topicId: string) => {
    setSelectedTopic(topicId);
    setChatStage('conversation');

    const topicResponses = {
      memories: "That's wonderful! I'd love to hear about your memories. What decade would you like to talk about?",
      current: "Let's talk about what's happening in the world. Have you heard any interesting news lately?",
      jokes: "I love a good laugh! Would you like to hear a joke, or do you have one to share?",
      music: "Music is so special! What kind of music do you enjoy? Or would you like me to play something?"
    };

    setMessages(prev => [...prev, {
      role: 'sarah',
      text: topicResponses[topicId as keyof typeof topicResponses]
    }]);
  };

  const extendConversation = () => {
    // AI-powered conversation extension based on topic
    const extensions = {
      memories: [
        "What was your favorite part about that time?",
        "That sounds wonderful! Who was with you?",
        "How did that make you feel?",
      ],
      current: [
        "What do you think about that?",
        "Have you experienced something similar?",
        "That's interesting! Tell me more.",
      ],
      jokes: [
        "That's hilarious! Here's another one...",
        "You have a great sense of humor!",
        "Would you like to hear another?",
      ],
      music: [
        "That's a beautiful song! What memories does it bring?",
        "Would you like me to play that for you?",
        "Who did you used to listen to that with?",
      ],
    };

    const topicExtensions = extensions[selectedTopic as keyof typeof extensions];
    const randomExtension = topicExtensions[Math.floor(Math.random() * topicExtensions.length)];

    setMessages(prev => [...prev, {
      role: 'sarah',
      text: randomExtension
    }]);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Social Chat with Sarah</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chat Messages */}
          <div className="space-y-3 min-h-[200px]">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.text}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Topic Selection */}
          {chatStage === 'greeting' && (
            <div>
              <p className="text-sm text-gray-600 mb-3">What would you like to talk about today?</p>
              <div className="grid grid-cols-2 gap-3">
                {topics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <Button
                      key={topic.id}
                      variant="outline"
                      onClick={() => handleTopicSelection(topic.id)}
                      className="justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {topic.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversation Actions */}
          {chatStage === 'conversation' && (
            <div className="flex gap-3">
              <Button onClick={extendConversation}>
                Continue Chatting
              </Button>
              <Button variant="outline" onClick={() => setChatStage('closing')}>
                End Chat
              </Button>
            </div>
          )}

          {/* Closing */}
          {chatStage === 'closing' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <p className="text-green-900">
                  Thank you for this lovely chat! It's been wonderful talking with you.
                  I'll check in with you again tomorrow. Take care!
                </p>
                <Button className="mt-3" onClick={onClose}>
                  Goodbye
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Validation (Must be executable)

### Level 1: Syntax & Type Checking

```bash
npm run build
npm run type-check
```

### Level 2: Component Testing

```bash
npm run test -- social/
npm run test:e2e -- --spec social-engagement
```

### Level 3: Integration Testing

```bash
# Test social metrics API
curl -X GET http://localhost:3000/api/social/metrics \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Test memory capture
curl -X POST http://localhost:3000/api/social/memories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "category": "childhood",
    "prompt": "What was your favorite game?",
    "response": "I loved playing hopscotch"
  }'
```

## Task List Validation

- [ ] Social dashboard displays correctly
- [ ] Daily chat initiates and flows properly
- [ ] Memory prompts generate appropriately
- [ ] Voice recording works for memories
- [ ] Activity suggestions personalize correctly
- [ ] Virtual gathering scheduling works
- [ ] Mood boost content displays
- [ ] Community events load
- [ ] Share functionality works
- [ ] Analytics track engagement

## Gotchas

1. **Cultural Sensitivity**: Memory prompts must be culturally appropriate
2. **Cognitive Ability**: Adapt complexity based on cognitive assessment
3. **Privacy**: Never share memories without explicit permission
4. **Pacing**: Don't overwhelm with too many prompts
5. **Emotional Triggers**: Some memories may cause distress

## Success Metrics

- 70% of users engage in daily social chat
- Average engagement time increases to 30+ minutes/day
- Loneliness scores decrease by 35% after 30 days
- 80% of users share at least one memory weekly
- Family engagement increases by 50%

## Dependencies

- Requires Phase 2 Dashboard (PRP-07)
- Integrates with Voice Components (PRP-14)
- Uses AI Chat from PRP-05
- Leverages notification system (PRP-11)

## Implementation Confidence

**Score: 9/10** - This PRP provides comprehensive social engagement features with clear implementation patterns, evidence-based approaches to combat loneliness, and respectful interaction design for elderly users.
