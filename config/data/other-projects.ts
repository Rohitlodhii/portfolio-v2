export interface OtherProjectType {
  title: string
  subtitle: string
  date: string
  languages: string[]
  main: string
  listitems?: string[]
  /** Repository / live URL — blank until a link exists. */
  link?: string
}

export const otherProjects: OtherProjectType[] = [
  {
    title: 'Deepfake Detector – CNN',
    subtitle: 'AI Authenticity Detection | Sept 2025',
    date: '09/25',
    languages: ['Python', 'CNN', 'PyTorch', 'AWS EC2', 'FastAPI', 'NextJS'],
    main: 'Analyzes facial images and provides a probabilistic authenticity score based on learned visual patterns.',
    listitems: [
      '🏘️ Identifying AI-generated (GAN-based) image artifacts rather than recognizing identities',
      '🤖 Exploration into AI authenticity, trust, and responsible deployment of detection systems',
      '🌐 Integrated the model with a Flask API and NextJS frontend for real-time deepfake prediction',
      '☁️ Deployed the full-stack application on AWS EC2 for scalable access',
      '⚡ Provides instant, reliable results on Deepfakes through an image upload on UI',
    ],
    link: '',
  },
  {
    title: 'Rent Predictor – ML Model',
    subtitle: 'Bhopal Rental Estimates | Jun 2025',
    date: '06/25',
    languages: ['Python', 'Scikit-learn', 'Pandas', 'AWS EC2', 'FastAPI', 'NextJS'],
    main: 'Machine learning–based rent prediction system trained on real Bhopal rental listings scraped from multiple sources, providing accurate rent estimation through a clean web interface.',
    listitems: [
      '🏘️ Scraped and consolidated rental data of Bhopal from multiple property listing websites',
      '🧹 Cleaned and preprocessed dataset (handling outliers, missing values, and encoding features)',
      '🤖 Trained regression model using Scikit-learn achieving an R² score of 0.8',
      '🌐 Integrated the model with a Flask API and React frontend for real-time rent predictions',
      '☁️ Deployed the full-stack application on AWS EC2 for scalable access',
      '📊 Visualized data trends to show price variations across areas, size, and amenities',
      '⚡ Provides instant, reliable rent estimates through a simple input form UI',
    ],
    link: '',
  },
  {
    title: 'Resume Builder – QuickResume',
    subtitle: 'Free ATS-friendly resumes | Feb 2024',
    date: '02/24',
    languages: ['ReactJS', 'TailwindCSS', 'Vercel', 'Node', 'PDF2'],
    main: 'A lightweight, free resume builder with multiple modern templates, instant preview and ATS-friendly exports — made for developers and job-seekers who want polished resumes fast.',
    listitems: [
      '🧾 Multiple professionally-designed templates (modern, minimal, creative) with easy switch in preview',
      '✍️ Simple fill-in form + instant live preview (desktop & mobile)',
      '📄 ATS-friendly exports (clean HTML & PDF) — optimized for applicant tracking systems',
      '💸 Completely free — no pricing, no paywall, no sign-up required to export',
    ],
    link: '',
  },
  {
    title: 'LinkedIn Post Generator',
    subtitle: 'AI-powered post writing | Jan 2025',
    date: '01/25',
    languages: ['NextJS', 'TailwindCSS', 'ShadCN', 'Gemini API', 'TypeScript', 'Vercel'],
    main: 'AI-powered LinkedIn post generator that crafts engaging and professional posts from small context inputs, helping users express ideas effectively with customizable tone and mood filters.',
    listitems: [
      '🧠 Generates LinkedIn posts using Gemini AI based on short user prompts or context',
      '🎯 Offers filters for tone, mood, emoji usage, and writing style to fine-tune the output',
      '⚙️ Built with modern stack — Next.js, ShadCN UI, TailwindCSS, and Gemini API integration',
      '📱 Responsive and minimal interface optimized for productivity and clarity',
      '🚀 Instant post preview with easy copy & share options',
      '💬 Designed for professionals, creators, and marketers to enhance their LinkedIn presence',
      '☁️ Fully deployed on Vercel with smooth and fast performance',
    ],
    link: '',
  },
  {
    title: 'ZMeet – Private Video Meet',
    subtitle: 'Private video conferencing MVP | Feb 2024',
    date: '02/24',
    languages: ['Node.js', 'WebRTC', 'HTML', 'CSS', 'JavaScript'],
    main: 'ZMeet is a lightweight video conferencing web app inspired by Google Meet, built as an MVP with a strong focus on privacy. Users can create secure rooms with a room name and password and join without any data being stored on the server.',
    listitems: [
      '🔒 Password-protected rooms for fully private meetings',
      '📹 Real-time video, audio, and screen sharing using WebRTC',
      '💬 Built-in live chat for seamless communication',
      '🎙️ Mute / unmute controls for audio and video streams',
      '🚀 Minimal MVP architecture with no user accounts or data persistence',
    ],
    link: '',
  },
  {
    title: 'Digital Fingerprint – Web Privacy Awareness',
    subtitle: 'Browser fingerprinting demo | Dec 2023',
    date: '12/23',
    languages: ['JavaScript', 'HTML', 'CSS', 'Browser APIs'],
    main: "Digital Fingerprint is an educational web project that demonstrates how websites can access and infer sensitive user information through browser and device-level data. The goal is to raise awareness about online privacy risks and highlight how easily a user's digital identity can be exposed while browsing the web.",
    listitems: [
      "🕵️‍♂️ Demonstrates browser fingerprinting concepts using built-in browser APIs",
      '🌍 Displays potential data points like device details, browser info, and environment data',
      '📊 Visual representation of user-exposed data to improve understanding',
      '🔐 No data collection or storage — all processing happens locally in the browser',
      '⚠️ Built to educate users about privacy risks on untrusted or unsafe websites',
    ],
    link: '',
  },
]
