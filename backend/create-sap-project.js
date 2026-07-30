const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  console.log("Creating SAP Fiori project...");

  const rahul = await p.user.findUnique({ where: { email: "rahul@flamingopharma.com" } });
  const akshay = await p.user.findUnique({ where: { email: "akshay@flamingopharma.com" } });
  const sagar = await p.user.findUnique({ where: { email: "sagar@flamingopharma.com" } });
  const nikhil = await p.user.findUnique({ where: { email: "nikhil@flamingopharma.com" } });
  const sameer = await p.user.findUnique({ where: { email: "sameer@flamingopharma.com" } });

  const project = await p.project.create({
    data: {
      name: "SAP Fiori Implementation",
      description: "End-to-end SAP Fiori UI modernization for Flamingo Pharma. Covers launchpad setup, user roles, custom app development, integration with SAP backend, testing and go-live support.",
      color: "#E8382D",
      department: "IT",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      ownerId: rahul.id,
      members: {
        create: [
          { userId: rahul.id, role: "OWNER" },
          { userId: akshay.id, role: "MEMBER" },
          { userId: sagar.id, role: "MEMBER" },
          { userId: nikhil.id, role: "MEMBER" },
          { userId: sameer.id, role: "MEMBER" },
        ]
      }
    }
  });

  console.log("Project created:", project.name);

  const tasks = [
    // Phase 1 - Planning
    { title: "Project Kickoff Meeting", description: "Initial meeting with all stakeholders. Define project scope, timeline, and responsibilities for SAP Fiori implementation at Flamingo Pharma.", status: "DONE", priority: "HIGH", assigneeId: rahul.id, daysFromNow: -20 },
    { title: "Gather Business Requirements", description: "Collect requirements from all departments. Document which SAP transactions need Fiori apps. Interview department heads.", status: "DONE", priority: "HIGH", assigneeId: akshay.id, daysFromNow: -18 },
    { title: "System Landscape Assessment", description: "Assess current SAP system landscape. Check SAP version compatibility for Fiori. Document existing BASIS setup and system requirements.", status: "DONE", priority: "HIGH", assigneeId: nikhil.id, daysFromNow: -15 },
    { title: "Create Project Plan & Timeline", description: "Create detailed project plan with milestones. Define sprint structure, deliverables and deadlines for each phase.", status: "DONE", priority: "MEDIUM", assigneeId: rahul.id, daysFromNow: -14 },

    // Phase 2 - Infrastructure Setup
    { title: "Install SAP Fiori Front-End Server", description: "Install and configure SAP Fiori Front-End Server (FES). Set up ABAP system for hosting Fiori apps. Configure ICM settings.", status: "DONE", priority: "URGENT", assigneeId: sagar.id, daysFromNow: -12 },
    { title: "Configure SAP Gateway", description: "Set up SAP Gateway for OData services. Activate required Gateway components. Test connectivity between Gateway and backend SAP system.", status: "DONE", priority: "HIGH", assigneeId: nikhil.id, daysFromNow: -10 },
    { title: "Setup Development Environment", description: "Set up SAP Web IDE or BAS (Business Application Studio) for developers. Configure connections to SAP backend. Install required plugins.", status: "DONE", priority: "HIGH", assigneeId: akshay.id, daysFromNow: -8 },

    // Phase 3 - User Auth & Roles
    { title: "Design Fiori Role Concept", description: "Design role and authorization concept for Fiori. Define which user groups get access to which Fiori apps. Create role matrix document.", status: "DONE", priority: "HIGH", assigneeId: rahul.id, daysFromNow: -7 },
    { title: "Create Fiori Catalog & Groups", description: "Create Fiori catalogs and groups in Launchpad Designer. Organize apps by department and user role. Set up tile groups for each department.", status: "IN_PROGRESS", priority: "HIGH", assigneeId: sagar.id, daysFromNow: 2 },
    { title: "Configure User Authentication (SSO)", description: "Configure Single Sign-On (SSO) for Fiori using SAML 2.0. Set up identity provider. Test SSO login for all user types.", status: "IN_PROGRESS", priority: "URGENT", assigneeId: nikhil.id, daysFromNow: 3 },
    { title: "Create and Assign SAP User Roles", description: "Create SAP roles for Fiori access. Assign roles to user groups. Test authorization checks for each role. Document final role assignments.", status: "TODO", priority: "HIGH", assigneeId: akshay.id, daysFromNow: 7 },

    // Phase 4 - Launchpad Setup
    { title: "Configure Fiori Launchpad", description: "Configure SAP Fiori Launchpad settings. Set up homepage layout, themes, and branding with Flamingo Pharma logo and colors.", status: "IN_PROGRESS", priority: "HIGH", assigneeId: sameer.id, daysFromNow: 5 },
    { title: "Activate Standard SAP Fiori Apps", description: "Activate standard SAP Fiori apps for MM, SD, FI modules. Configure OData services. Test each app with sample data.", status: "TODO", priority: "HIGH", assigneeId: sagar.id, daysFromNow: 10 },
    { title: "Customize Launchpad Branding", description: "Apply Flamingo Pharma branding to Fiori Launchpad. Update colors, logo, and theme. Ensure consistent look across all devices.", status: "TODO", priority: "MEDIUM", assigneeId: sameer.id, daysFromNow: 12 },
    { title: "Setup Fiori Notifications", description: "Configure Fiori notification framework. Set up workflow notifications for approvals. Test notification delivery on desktop and mobile.", status: "TODO", priority: "MEDIUM", assigneeId: nikhil.id, daysFromNow: 14 },

    // Phase 5 - Custom App Development
    { title: "Develop Custom Leave Approval App", description: "Build custom Fiori app for HR leave approval workflow. Create OData service, SAPUI5 frontend, and backend ABAP logic. Mobile-responsive design.", status: "TODO", priority: "HIGH", assigneeId: akshay.id, daysFromNow: 15 },
    { title: "Develop Purchase Order Tracking App", description: "Build Fiori app for purchase order status tracking. Integrate with SAP MM module. Allow users to track PO status, delivery dates, and GRN.", status: "TODO", priority: "HIGH", assigneeId: sagar.id, daysFromNow: 18 },
    { title: "Develop Quality Inspection App", description: "Custom Fiori app for QA inspection results entry. Integrate with SAP QM module. Allow QA team to record inspection results on tablets.", status: "TODO", priority: "MEDIUM", assigneeId: sameer.id, daysFromNow: 20 },
    { title: "Develop Manager Dashboard App", description: "Executive dashboard Fiori app with KPIs for department managers. Show project status, pending approvals, and team workload in real-time.", status: "TODO", priority: "HIGH", assigneeId: akshay.id, daysFromNow: 22 },

    // Phase 6 - Testing & UAT
    { title: "Unit Testing - All Custom Apps", description: "Perform unit testing for all custom developed Fiori apps. Fix bugs found during testing. Document test results and sign-off.", status: "TODO", priority: "HIGH", assigneeId: nikhil.id, daysFromNow: 30 },
    { title: "Integration Testing with SAP Backend", description: "Test all OData service integrations. Verify data flow between Fiori frontend and SAP backend. Test error handling and edge cases.", status: "TODO", priority: "URGENT", assigneeId: sagar.id, daysFromNow: 33 },
    { title: "Performance & Load Testing", description: "Conduct performance testing for Fiori Launchpad and apps. Test with 50+ concurrent users. Optimize slow-loading apps and OData calls.", status: "TODO", priority: "HIGH", assigneeId: nikhil.id, daysFromNow: 36 },
    { title: "User Acceptance Testing (UAT)", description: "Conduct UAT with key users from each department. Collect feedback and document required changes. Get sign-off from department heads.", status: "TODO", priority: "URGENT", assigneeId: rahul.id, daysFromNow: 40 },
    { title: "Security Testing & Authorization Check", description: "Perform security audit of all Fiori apps. Test authorization objects. Ensure no unauthorized data access. Penetration testing on Fiori Gateway.", status: "TODO", priority: "HIGH", assigneeId: akshay.id, daysFromNow: 42 },
    { title: "Mobile Responsiveness Testing", description: "Test all Fiori apps on iOS and Android devices. Test on various screen sizes. Fix any mobile-specific UI issues found.", status: "TODO", priority: "MEDIUM", assigneeId: sameer.id, daysFromNow: 38 },

    // Phase 7 - Training & Go Live
    { title: "Prepare User Training Material", description: "Create training manuals and video guides for end users. Prepare role-specific training content. Create quick reference cards for each Fiori app.", status: "TODO", priority: "MEDIUM", assigneeId: rahul.id, daysFromNow: 50 },
    { title: "Conduct End User Training", description: "Deliver training sessions to all end users department-wise. Cover Fiori Launchpad navigation and key apps. Collect training feedback.", status: "TODO", priority: "HIGH", assigneeId: rahul.id, daysFromNow: 55 },
    { title: "Prepare Go-Live Checklist", description: "Create detailed go-live checklist. Verify all configuration, authorizations, and custom apps are production-ready. Get final approvals.", status: "TODO", priority: "URGENT", assigneeId: sagar.id, daysFromNow: 58 },
    { title: "Production System Migration", description: "Transport all Fiori configurations to production. Apply roles and authorizations. Final verification in production environment.", status: "TODO", priority: "URGENT", assigneeId: nikhil.id, daysFromNow: 62 },
    { title: "Go Live - SAP Fiori Launch", description: "Official go-live of SAP Fiori at Flamingo Pharma. Monitor system performance. Provide hypercare support for first week. Celebrate success!", status: "TODO", priority: "URGENT", assigneeId: rahul.id, daysFromNow: 65 },
    { title: "Post Go-Live Support & Monitoring", description: "Provide 30-day post go-live support. Monitor system performance and user adoption. Address issues and enhancement requests from users.", status: "TODO", priority: "HIGH", assigneeId: sameer.id, daysFromNow: 90 },
  ];

  for (const task of tasks) {
    const { daysFromNow, ...taskData } = task;
    await p.task.create({
      data: {
        ...taskData,
        projectId: project.id,
        dueDate: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
      }
    });
    process.stdout.write(".");
  }

  console.log("\nAll tasks created!");
  console.log("Total tasks:", tasks.length);
  console.log("\nProject Summary:");
  console.log("  Done:        ", tasks.filter(t => t.status === "DONE").length, "tasks");
  console.log("  In Progress: ", tasks.filter(t => t.status === "IN_PROGRESS").length, "tasks");
  console.log("  Todo:        ", tasks.filter(t => t.status === "TODO").length, "tasks");
  console.log("\nLogin as rahul@flamingopharma.com to see the project!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());