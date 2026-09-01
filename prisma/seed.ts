import { PrismaClient, type JobLevel, type JobStatus } from "@prisma/client";
import { exampleJobs, exampleLeads } from "../src/data/examples";

const prisma = new PrismaClient();

const jobStatus: Record<string, JobStatus> = {
  not_applied: "not_applied",
  applied: "applied",
  deleted: "deleted",
};

const jobLevel: Record<string, JobLevel> = {
  Mid: "mid",
  Senior: "senior",
};

async function main() {
  await prisma.revenue.deleteMany();
  await prisma.client.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.job.deleteMany();

  await prisma.job.createMany({
    data: exampleJobs.map((job) => ({
      title: job.title,
      url: job.url,
      company: job.company,
      location: job.location,
      country: job.country,
      level: jobLevel[job.level],
      skills: job.skills,
      source: job.source,
      status: jobStatus[job.status],
    })),
  });

  await prisma.lead.createMany({
    data: exampleLeads.map((lead) => ({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      url: lead.url || null,
      location: lead.location,
      country: lead.country,
      note: lead.note,
      source: lead.source,
      status: lead.status,
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
