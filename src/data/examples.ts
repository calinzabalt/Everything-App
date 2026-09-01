export type JobStatus = "not_applied" | "applied" | "deleted";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  level: "Mid" | "Senior";
  skills: string[];
  source: string;
  url: string;
  status: JobStatus;
};

export type LeadStatus =
  | "new"
  | "contacted"
  | "lead"
  | "won"
  | "closed"
  | "deleted";

export type Lead = {
  id: string;
  name: string;
  location: string;
  country: string;
  note: string;
  email: string;
  phone: string;
  url: string;
  source: string;
  status: LeadStatus;
};

const jobDrafts: Omit<Job, "status">[] = [
  {
    id: "job-1",
    title: "Senior React / TypeScript Developer",
    company: "Nordpay",
    location: "Bucharest",
    country: "Romania",
    level: "Senior",
    skills: ["React", "TypeScript"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-2",
    title: "WordPress Developer",
    company: "Harbour Studio",
    location: "London",
    country: "United Kingdom",
    level: "Mid",
    skills: ["WordPress", "PHP"],
    source: "wordpress.org",
    url: "https://jobs.wordpress.net/",
  },
  {
    id: "job-3",
    title: "Mid React Engineer",
    company: "ClipStack",
    location: "Cluj-Napoca",
    country: "Romania",
    level: "Mid",
    skills: ["React", "TypeScript"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-4",
    title: "Senior WordPress Engineer",
    company: "Brightleaf",
    location: "Austin",
    country: "United States",
    level: "Senior",
    skills: ["WordPress", "React"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-5",
    title: "TypeScript Frontend Developer",
    company: "Lumen Labs",
    location: "Remote",
    country: "Romania",
    level: "Mid",
    skills: ["TypeScript", "React"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-6",
    title: "WordPress Theme Developer",
    company: "Oak & Pine",
    location: "Manchester",
    country: "United Kingdom",
    level: "Mid",
    skills: ["WordPress", "CSS"],
    source: "wordpress.org",
    url: "https://jobs.wordpress.net/",
  },
  {
    id: "job-7",
    title: "Senior Full-Stack React",
    company: "Payroute",
    location: "Timișoara",
    country: "Romania",
    level: "Senior",
    skills: ["React", "TypeScript", "Node"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-8",
    title: "WordPress Plugin Developer",
    company: "Northwind WP",
    location: "New York",
    country: "United States",
    level: "Senior",
    skills: ["WordPress", "PHP"],
    source: "wordpress.org",
    url: "https://jobs.wordpress.net/",
  },
  {
    id: "job-9",
    title: "React Native / TypeScript",
    company: "Movio",
    location: "Iași",
    country: "Romania",
    level: "Mid",
    skills: ["React", "TypeScript"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-10",
    title: "Senior Frontend Engineer",
    company: "Clearline",
    location: "London",
    country: "United Kingdom",
    level: "Senior",
    skills: ["React", "TypeScript"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-11",
    title: "WordPress Maintenance Lead",
    company: "SiteKeep",
    location: "Bristol",
    country: "United Kingdom",
    level: "Senior",
    skills: ["WordPress"],
    source: "wordpress.org",
    url: "https://jobs.wordpress.net/",
  },
  {
    id: "job-12",
    title: "Mid Next.js Developer",
    company: "Folio",
    location: "Brașov",
    country: "Romania",
    level: "Mid",
    skills: ["React", "TypeScript", "Next.js"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-13",
    title: "Senior WordPress / React",
    company: "Headless Co",
    location: "Chicago",
    country: "United States",
    level: "Senior",
    skills: ["WordPress", "React"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-14",
    title: "TypeScript Engineer",
    company: "Orbital",
    location: "Remote",
    country: "United Kingdom",
    level: "Mid",
    skills: ["TypeScript", "Node"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-15",
    title: "WordPress Developer",
    company: "Atelier Web",
    location: "Constanța",
    country: "Romania",
    level: "Mid",
    skills: ["WordPress", "WooCommerce"],
    source: "wordpress.org",
    url: "https://jobs.wordpress.net/",
  },
  {
    id: "job-16",
    title: "Senior React Engineer",
    company: "Kitebank",
    location: "San Francisco",
    country: "United States",
    level: "Senior",
    skills: ["React", "TypeScript"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-17",
    title: "Frontend Developer",
    company: "Softleaf",
    location: "Oradea",
    country: "Romania",
    level: "Mid",
    skills: ["React", "CSS"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-18",
    title: "Senior TypeScript Developer",
    company: "Hearth",
    location: "Edinburgh",
    country: "United Kingdom",
    level: "Senior",
    skills: ["TypeScript", "React"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "job-19",
    title: "WordPress Full-Stack",
    company: "Pine & Code",
    location: "Sibiu",
    country: "Romania",
    level: "Senior",
    skills: ["WordPress", "PHP", "React"],
    source: "wordpress.org",
    url: "https://jobs.wordpress.net/",
  },
  {
    id: "job-20",
    title: "Mid React Developer",
    company: "Vellum",
    location: "Boston",
    country: "United States",
    level: "Mid",
    skills: ["React", "TypeScript"],
    source: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
  },
];

const jobStatusById: Record<string, JobStatus> = {
  "job-2": "applied",
  "job-7": "applied",
  "job-10": "applied",
  "job-13": "applied",
  "job-19": "deleted",
  "job-20": "deleted",
};

export const exampleJobs: Job[] = jobDrafts.map((job) => ({
  ...job,
  status: jobStatusById[job.id] ?? "not_applied",
}));

export const exampleLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Panificație Mureș",
    location: "Târgu Mureș",
    country: "Romania",
    note: "Local bakery. No website.",
    email: "contact@example.ro",
    phone: "+40 265 123 456",
    url: "",
    source: "Google Maps",
    status: "new",
  },
  {
    id: "lead-2",
    name: "North Peak Digital",
    location: "Manchester",
    country: "United Kingdom",
    note: "Agency looking for WordPress and React work.",
    email: "hello@example.co.uk",
    phone: "+44 161 496 0123",
    url: "https://northpeak.example",
    source: "Clutch",
    status: "new",
  },
];
