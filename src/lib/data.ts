
import type { Ministry, State, Project, Feedback, ImpactStat, NewsArticle, ServiceItem, Video } from '@/types';
import { Briefcase, Users, DollarSign, TrendingUp, MapPin, CalendarDays, Flag, ShieldCheck, BookOpen, Heart, Building, Globe, Plane, Award, Rss, MessageCircle } from 'lucide-react';

export const ministries: Ministry[] = [
  { id: 'm1', name: 'Federal Ministry of Works and Housing' },
  { id: 'm2', name: 'Federal Ministry of Finance, Budget and National Planning' },
  { id: 'm3', name: 'Federal Ministry of Education' },
  { id: 'm4', name: 'Federal Ministry of Health' },
  { id: 'm5', name: 'Federal Ministry of Agriculture and Rural Development' },
  { id: 'm6', name: 'Federal Ministry of Communications and Digital Economy' },
  { id: 'm7', name: 'Federal Ministry of Humanitarian Affairs, Disaster Management and Social Development' },
];

export const states: State[] = [
  { id: 's1', name: 'Lagos' },
  { id: 's2', name: 'Kano' },
  { id: 's3', name: 'Rivers' },
  { id: 's4', name: 'Abuja (FCT)' },
  { id: 's5', name: 'Oyo' },
  { id: 's6', name: 'Kaduna' },
  { id: 's7', name: 'Enugu' },
];

const generateFeedback = (projectId: string, count: number): Feedback[] => {
  const feedback: Feedback[] = [];
  const users = ['Aisha Bello', 'Chinedu Okafor', 'Yemi Adebayo', 'Fatima Sani'];
  const comments = [
    "This is a great initiative, keep up the good work!",
    "I have some concerns about the timeline, seems a bit ambitious.",
    "Excellent progress so far, very impressive.",
    "Could we get more frequent updates on this project?",
    "The impact on our community is already visible. Thank you!"
  ];
  for (let i = 0; i < count; i++) {
    feedback.push({
      id: `f${projectId}-${i + 1}`,
      projectId,
      userName: users[i % users.length],
      comment: comments[i % comments.length],
      rating: Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
      createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30), // Within last 30 days
      sentimentSummary: Math.random() > 0.5 ? 'Positive' : 'Mixed', // Placeholder
    });
  }
  return feedback;
};

const defaultImpactStats: ImpactStat[] = [
    { label: "Jobs Created", value: "1,200+", icon: Briefcase },
    { label: "Citizens Benefited", value: "50,000+", icon: Users },
    { label: "Budget Allocated", value: "₦5.2B", icon: DollarSign },
    { label: "Economic Impact", value: "+3% GDP Growth", icon: TrendingUp },
];

const projectVideos: Video[] = [
  { id: 'vid1', title: 'Project Overview Video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: 'https://placehold.co/600x338.png', description: 'An overview of the project goals and impact.'},
  { id: 'vid2', title: 'Community Impact Story', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/600x338.png', description: 'Hear from those directly benefiting from this initiative.'},
];


export const projects: Project[] = [
  {
    id: 'p1',
    title: 'Lagos-Ibadan Expressway Rehabilitation',
    subtitle: 'Enhancing connectivity and reducing travel time between two major economic hubs.',
    ministry: ministries[0],
    state: states[0],
    status: 'Ongoing',
    startDate: new Date('2018-07-01'),
    expectedEndDate: new Date('2024-12-31'),
    description: `
      <p>The Lagos-Ibadan Expressway is a critical artery in Nigeria's road network, connecting the nation's commercial capital, Lagos, with Ibadan, a major industrial and agricultural center. This rehabilitation project aims to:</p>
      <ul>
        <li>Expand the expressway to three lanes in each direction for significant portions.</li>
        <li>Reconstruct and overlay existing pavement to modern standards.</li>
        <li>Improve drainage systems to mitigate flooding.</li>
        <li>Install new road markings, signage, and safety barriers.</li>
      </ul>
      <p>Upon completion, the project is expected to significantly reduce travel times, improve road safety, and boost economic activities along the corridor.</p>
    `,
    images: [
      { url: 'https://placehold.co/800x600.png', alt: 'Lagos-Ibadan Expressway construction site', dataAiHint: 'road construction' },
      { url: 'https://placehold.co/800x600.png', alt: 'Newly paved section of the expressway', dataAiHint: 'paved road' },
      { url: 'https://placehold.co/800x600.png', alt: 'Bridge construction on the expressway', dataAiHint: 'bridge construction' },
    ],
    videos: projectVideos,
    impactStats: defaultImpactStats,
    budget: 310_000_000_000, 
    expenditure: 220_000_000_000,
    tags: ['Infrastructure', 'Roads', 'Transportation', 'Economic Development'],
    lastUpdatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7), 
    feedback: generateFeedback('p1', 3),
  },
  {
    id: 'p2',
    title: 'National Social Investment Program (NSIP)',
    subtitle: 'A suite of programs designed to reduce poverty and improve livelihoods across Nigeria.',
    ministry: ministries[6],
    state: states[3], 
    status: 'Ongoing',
    startDate: new Date('2016-06-01'),
    description: `
      <p>The National Social Investment Program (NSIP) is a Federal Government initiative aimed at tackling poverty and hunger across the country. Key components include:</p>
      <ul>
        <li><strong>N-Power:</strong> A job creation and skills empowerment program for unemployed graduates.</li>
        <li><strong>Conditional Cash Transfers (CCT):</strong> Provides cash stipends to vulnerable households.</li>
        <li><strong>Home Grown School Feeding Program (HGSFP):</strong> Aims to improve child nutrition and school enrollment.</li>
        <li><strong>Government Enterprise and Empowerment Program (GEEP):</strong> Offers micro-loans to small business owners.</li>
      </ul>
      <p>The NSIP seeks to provide a social safety net for millions of Nigerians and stimulate economic activity at the grassroots level.</p>
    `,
    images: [
      { url: 'https://placehold.co/800x600.png', alt: 'N-Power beneficiaries at a training session', dataAiHint: 'people training' },
      { url: 'https://placehold.co/800x600.png', alt: 'Children receiving meals under HGSFP', dataAiHint: 'children eating' },
      { url: 'https://placehold.co/800x600.png', alt: 'GEEP loan recipient showcasing their business', dataAiHint: 'small business' },
    ],
    impactStats: [
      { label: "Beneficiaries Reached", value: "12M+", icon: Users },
      { label: "Schools in Feeding Program", value: "50,000+", icon: MapPin }, 
      { label: "N-Power Graduates", value: "500,000+", icon: Briefcase },
      { label: "Total Disbursement", value: "₦600B+", icon: DollarSign },
    ],
    tags: ['Social Welfare', 'Poverty Alleviation', 'Youth Empowerment', 'Education', 'Small Business'],
    lastUpdatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 3),
    feedback: generateFeedback('p2', 5),
  },
  {
    id: 'p3',
    title: 'Digital Nigeria Initiative',
    subtitle: 'Transforming Nigeria into a leading digital economy through skills development and infrastructure.',
    ministry: ministries[5],
    state: states[3], 
    status: 'Ongoing',
    startDate: new Date('2019-10-01'),
    description: `
      <p>The Digital Nigeria Initiative is a comprehensive strategy to leverage digital technologies for economic growth and societal development. Core pillars include:</p>
      <ul>
        <li><strong>Digital Skills Development:</strong> Training programs to equip Nigerians with relevant digital skills.</li>
        <li><strong>Broadband Penetration:</strong> Expanding access to affordable and reliable internet connectivity.</li>
        <li><strong>Digital Identity Program:</strong> Establishing a robust national digital identity system.</li>
        <li><strong>E-Government Services:</strong> Digitizing government processes and services for improved efficiency.</li>
      </ul>
      <p>The initiative aims to foster innovation, create jobs, and enhance Nigeria's competitiveness in the global digital landscape.</p>
    `,
    images: [
      { url: 'https://placehold.co/800x600.png', alt: 'Students in a digital skills workshop', dataAiHint: 'students computers' },
      { url: 'https://placehold.co/800x600.png', alt: 'Fiber optic cable installation', dataAiHint: 'fiber optic' },
      { url: 'https://placehold.co/800x600.png', alt: 'Citizen using an e-government portal', dataAiHint: 'person computer' },
    ],
    impactStats: [
      { label: "Digital Skills Trainees", value: "1M+", icon: Users },
      { label: "Broadband Coverage", value: "70% Target", icon: Flag }, 
      { label: "Tech Hubs Supported", value: "150+", icon: Briefcase },
      { label: "Projected Job Creation", value: "2M+", icon: TrendingUp },
    ],
    budget: 50_000_000_000,
    tags: ['Technology', 'Digital Economy', 'Skills Development', 'Infrastructure', 'Innovation'],
    lastUpdatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 5),
    feedback: generateFeedback('p3', 4),
  },
   {
    id: 'p4',
    title: 'Abuja Light Rail Modernization',
    subtitle: 'Upgrading the Abuja light rail system for improved urban mobility.',
    ministry: ministries[0], 
    state: states[3], 
    status: 'Planned',
    startDate: new Date('2024-08-01'),
    expectedEndDate: new Date('2027-12-31'),
    description: `
      <p>The Abuja Light Rail Modernization project aims to enhance the existing light rail infrastructure within the Federal Capital Territory. Key objectives include:</p>
      <ul>
        <li>Extension of existing lines to cover more districts.</li>
        <li>Procurement of new, modern rolling stock.</li>
        <li>Implementation of an integrated ticketing and passenger information system.</li>
        <li>Improvement of station facilities and accessibility.</li>
      </ul>
      <p>This project will significantly improve public transportation in Abuja, reduce traffic congestion, and promote sustainable urban development.</p>
    `,
    images: [
      { url: 'https://placehold.co/800x600.png', alt: 'Concept art of modernized Abuja light rail train', dataAiHint: 'modern train' },
      { url: 'https://placehold.co/800x600.png', alt: 'Map of proposed light rail extensions', dataAiHint: 'city map' },
      { url: 'https://placehold.co/800x600.png', alt: 'Interior design of new train carriage', dataAiHint: 'train interior' },
    ],
    impactStats: [
      { label: "Projected Ridership", value: "200,000/day", icon: Users },
      { label: "New Track Kilometers", value: "45km", icon: MapPin },
      { label: "Estimated Budget", value: "₦150B", icon: DollarSign },
      { label: "Construction Jobs", value: "3,000+", icon: Briefcase },
    ],
    budget: 150_000_000_000,
    tags: ['Urban Transport', 'Railways', 'Infrastructure', 'Abuja', 'Sustainability'],
    lastUpdatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 2),
    feedback: [], 
  },
];

export const mockNews: NewsArticle[] = [
  {
    id: 'news1',
    slug: 'government-launches-new-portal-for-project-transparency',
    title: 'Government Launches New Portal for Project Transparency',
    summary: 'A new online platform, NigeriaGovHub, has been launched to provide citizens with transparent access to government projects and initiatives.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'government building',
    category: 'Governance',
    publishedDate: new Date('2024-05-15T10:00:00Z'),
    content: '<p>The Federal Government today unveiled NigeriaGovHub, a landmark initiative aimed at enhancing transparency and accountability in public project execution. The portal offers detailed information on projects nationwide, including budgets, timelines, and implementing agencies. Citizens can track progress, provide feedback, and engage directly with governance processes. This platform marks a significant step towards open government and citizen participation.</p>',
  },
  {
    id: 'news2',
    slug: 'digital-skills-initiative-empowers-10000-youths',
    title: 'Digital Skills Initiative Empowers 10,000 Youths in Q1',
    summary: 'The ongoing Digital Nigeria program has successfully trained over 10,000 young Nigerians in various digital skills in the first quarter of the year.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'students computers',
    category: 'Technology',
    publishedDate: new Date('2024-05-10T14:30:00Z'),
    content: '<p>The first quarter of the Digital Nigeria Initiative has seen remarkable success, with over 10,000 youths completing training in areas such as software development, data analysis, and digital marketing. The program aims to equip young Nigerians with the skills needed for the digital economy, fostering innovation and job creation. Testimonials from beneficiaries highlight the transformative impact of the initiative.</p>',
  },
  {
    id: 'news3',
    slug: 'agricultural-reforms-boost-food-production',
    title: 'Agricultural Reforms Lead to Boost in Food Production',
    summary: 'Recent agricultural reforms and support programs are showing positive results, with a noticeable increase in food production reported by farmers.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'farm field',
    category: 'Agriculture',
    publishedDate: new Date('2024-05-05T09:00:00Z'),
    content: '<p>Farmers across the nation are reporting increased yields and improved market access following the implementation of new agricultural reforms. These reforms include better access to credit, subsidized inputs, and enhanced extension services. The Ministry of Agriculture expressed optimism that these measures will significantly contribute to food security and reduce reliance on imports.</p>',
  },
];

export const mockServices: ServiceItem[] = [
  {
    id: 'service1',
    slug: 'apply-for-passport',
    title: 'Apply for International Passport',
    summary: 'Access the portal to apply for or renew your Nigerian international passport.',
    icon: Plane,
    category: 'Immigration',
    link: '#', // Placeholder link
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'passport document',
  },
  {
    id: 'service2',
    slug: 'file-your-taxes',
    title: 'File Your Taxes Online',
    summary: 'Conveniently file your personal or business taxes through the FIRS online portal.',
    icon: Building,
    category: 'Taxation',
    link: '#',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'tax form',
  },
  {
    id: 'service3',
    slug: 'register-a-business',
    title: 'Register a Business',
    summary: 'Start your entrepreneurial journey by registering your new business with the CAC.',
    icon: Briefcase,
    category: 'Business',
    link: '#',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'business handshake',
  },
];

export const mockFeaturedVideos: Video[] = [
  { id: 'fv1', title: 'Nigeria\'s Vision 2050', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'futuristic city', description: 'A look into Nigeria\'s long-term development plan.' },
  { id: 'fv2', title: 'Infrastructure Development Update', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'construction site', description: 'Latest updates on key infrastructure projects.' },
  { id: 'fv3', title: 'Empowering Young Innovators', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'young people technology', description: 'Highlighting support for tech startups.' },
  { id: 'fv4', title: 'Cultural Heritage Preservation', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'cultural artifacts', description: 'Efforts to preserve Nigeria\'s rich cultural heritage.' },
  { id: 'fv5', title: 'Healthcare Advancements', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'modern hospital', description: 'Innovations in the Nigerian healthcare sector.' },
  { id: 'fv6', title: 'Green Nigeria: Sustainability Efforts', url: 'https://www.youtube.com/embed/rokGy0huYEA', thumbnailUrl: 'https://placehold.co/300x200.png', dataAiHint: 'solar panels forest', description: ' Initiatives towards a sustainable future.' },
];


// Function to get a single project by ID
export const getProjectById = (id: string): Project | undefined => {
  return projects.find(p => p.id === id);
};

// Function to get all projects, with optional filtering
export const getAllProjects = (filters?: { ministryId?: string; stateId?: string; status?: string; startDate?: Date }): Project[] => {
  let filteredProjects = projects;
  if (filters?.ministryId) {
    filteredProjects = filteredProjects.filter(p => p.ministry.id === filters.ministryId);
  }
  if (filters?.stateId) {
    filteredProjects = filteredProjects.filter(p => p.state.id === filters.stateId);
  }
  if (filters?.status) {
    filteredProjects = filteredProjects.filter(p => p.status === filters.status);
  }
  // Add date filtering if needed
  return filteredProjects;
};

export const addFeedbackToProject = (projectId: string, feedback: Omit<Feedback, 'id' | 'createdAt' | 'projectId'>): Feedback | null => {
  const project = getProjectById(projectId);
  if (!project) return null;

  const newFeedback: Feedback = {
    ...feedback,
    id: `f${projectId}-${(project.feedback?.length || 0) + 1}`,
    projectId,
    createdAt: new Date(),
  };

  if (!project.feedback) {
    project.feedback = [];
  }
  project.feedback.push(newFeedback);
  return newFeedback;
};

export const getNewsArticleBySlug = (slug: string): NewsArticle | undefined => {
  return mockNews.find(article => article.slug === slug);
};

export const getAllNewsArticles = (): NewsArticle[] => {
  return mockNews.sort((a,b) => b.publishedDate.getTime() - a.publishedDate.getTime());
};

export const getAllServices = (): ServiceItem[] => {
  return mockServices;
};

export const getServiceBySlug = (slug: string): ServiceItem | undefined => {
  return mockServices.find(service => service.slug === slug);
};
