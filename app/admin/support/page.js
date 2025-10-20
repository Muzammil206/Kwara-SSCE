"use client"

import { useState } from "react"
import { Search, Mail, Phone, MessageSquare, FileText, ExternalLink, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [newTicketVisible, setNewTicketVisible] = useState(false)
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketCategory, setTicketCategory] = useState("")
  const [ticketDescription, setTicketDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleTicketSubmit = async (e) => {
    e.preventDefault()

    if (!ticketSubject || !ticketCategory || !ticketDescription) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, you would submit to your database
      // const { error } = await supabase.from("support_tickets").insert({
      //   subject: ticketSubject,
      //   category: ticketCategory,
      //   description: ticketDescription,
      //   status: "open",
      //   created_at: new Date().toISOString(),
      // })

      // if (error) throw error

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Support ticket submitted successfully")
      setTicketSubject("")
      setTicketCategory("")
      setTicketDescription("")
      setNewTicketVisible(false)
    } catch (error) {
      console.error("Error submitting ticket:", error.message)
      toast.error("Failed to submit ticket. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
      </div>

      <div className="relative w-full max-w-md mx-auto mb-8">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help topics..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-6">
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Management</CardTitle>
                <CardDescription>Frequently asked questions about managing applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs
                    .filter((faq) => faq.category === "applications")
                    .map((faq, index) => (
                      <AccordionItem key={index} value={`faq-app-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Processing</CardTitle>
                <CardDescription>Frequently asked questions about payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs
                    .filter((faq) => faq.category === "payments")
                    .map((faq, index) => (
                      <AccordionItem key={index} value={`faq-pay-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Frequently asked questions about managing users</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs
                    .filter((faq) => faq.category === "users")
                    .map((faq, index) => (
                      <AccordionItem key={index} value={`faq-user-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Issues</CardTitle>
                <CardDescription>Frequently asked questions about technical problems</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs
                    .filter((faq) => faq.category === "technical")
                    .map((faq, index) => (
                      <AccordionItem key={index} value={`faq-tech-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is available via email 24/7. We typically respond within 24 hours.
                </p>
                <p className="font-medium">support@pillarapp.com</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => (window.location.href = "mailto:support@pillarapp.com")}>
                  Send Email
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Phone Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Call our dedicated support line during business hours (9 AM - 5 PM, Monday to Friday).
                </p>
                <p className="font-medium">+234 123 456 7890</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => (window.location.href = "tel:+2341234567890")}>
                  Call Support
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our support team in real-time during business hours for immediate assistance.
                </p>
                <p className="font-medium">Available 9 AM - 5 PM</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Start Chat</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Support Tickets</h2>
            <Button onClick={() => setNewTicketVisible(!newTicketVisible)}>
              {newTicketVisible ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </>
              )}
            </Button>
          </div>

          {newTicketVisible && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Submit a New Support Ticket</CardTitle>
                <CardDescription>
                  Please provide details about your issue and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application">Application Issue</SelectItem>
                        <SelectItem value="payment">Payment Issue</SelectItem>
                        <SelectItem value="account">Account Access</SelectItem>
                        <SelectItem value="technical">Technical Problem</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Please provide as much detail as possible"
                      rows={5}
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {recentTickets.map((ticket, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{ticket.subject}</CardTitle>
                      <CardDescription>
                        Ticket #{ticket.id} • {format(new Date(ticket.date), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        ticket.status === "open"
                          ? "bg-green-100 text-green-800"
                          : ticket.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(ticket.updated), "MMM d, yyyy")}
                  </p>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  User Guides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Admin Dashboard Guide</h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Complete guide to using the admin dashboard</p>
                </div>

                <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Application Management Guide</h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">How to process and manage applications</p>
                </div>

                <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Payment Processing Guide</h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Managing payments and verifications</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Technical Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">API Documentation</h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Complete API reference for developers</p>
                </div>

                <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Database Schema</h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Database structure and relationships</p>
                </div>

                <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Troubleshooting Guide</h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Common issues and their solutions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>Step-by-step video guides for common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {videoTutorials.map((video, index) => (
                    <div key={index} className="border rounded-md overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm">{video.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{video.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Sample data for FAQs
const faqs = [
  {
    category: "applications",
    question: "How do I approve an application?",
    answer:
      "To approve an application, navigate to the Applications page, find the application you want to approve, click the menu icon, and select 'Approve'. You can also open the application details and change the status to 'Approved'.",
  },
  {
    category: "applications",
    question: "Can I edit an application after it's been submitted?",
    answer:
      "Administrators can edit certain fields of an application even after submission. Open the application details, make the necessary changes, and save the updates.",
  },
  {
    category: "applications",
    question: "How do I filter applications by status?",
    answer:
      "On the Applications page, use the status filter dropdown to select the status you want to filter by (Approved, Pending, or Rejected).",
  },
  {
    category: "applications",
    question: "What happens when I reject an application?",
    answer:
      "When you reject an application, the status changes to 'Rejected', and the applicant is automatically notified via email. They may be able to address the issues and resubmit depending on your system configuration.",
  },
  {
    category: "payments",
    question: "How do I verify a payment?",
    answer:
      "To verify a payment, go to the Payments page, find the payment with 'Pending' or 'Verification Pending' status, review the attached receipt, and then mark it as 'Paid' if everything is correct.",
  },
  {
    category: "payments",
    question: "Can I issue a refund?",
    answer:
      "Yes, you can issue a refund by changing the payment status to 'Refunded'. Note that this only updates the status in the system - the actual refund process must be handled through your financial department or payment processor.",
  },
  {
    category: "payments",
    question: "How do I download payment receipts?",
    answer:
      "You can download payment receipts by viewing the payment details and clicking the 'Download Receipt' button. Receipts are also available directly from the payment list via the actions menu.",
  },
  {
    category: "payments",
    question: "What's the difference between 'Pending' and 'Verification Pending'?",
    answer:
      "'Pending' means no payment has been recorded yet, while 'Verification Pending' means the user has submitted payment information that needs to be verified by an administrator.",
  },
  {
    category: "users",
    question: "How do I reset a user's password?",
    answer:
      "As an administrator, you can reset a user's password by going to the User Management section, finding the user, and selecting 'Reset Password' from the actions menu. The user will receive an email with instructions.",
  },
  {
    category: "users",
    question: "Can I deactivate a user account?",
    answer:
      "Yes, you can deactivate a user account from the User Management section. Find the user, click on the actions menu, and select 'Deactivate Account'. This will prevent the user from logging in until the account is reactivated.",
  },
  {
    category: "users",
    question: "How do I add a new administrator?",
    answer:
      "To add a new administrator, go to User Management, click 'Add User', fill in their details, and select the 'Administrator' role. They will receive an email invitation to set up their account.",
  },
  {
    category: "technical",
    question: "The system is running slowly. What can I do?",
    answer:
      "If the system is running slowly, try clearing your browser cache and cookies, ensure you're using a supported browser (Chrome, Firefox, Edge, or Safari), and check your internet connection. If problems persist, contact technical support.",
  },
  {
    category: "technical",
    question: "How do I export data from the system?",
    answer:
      "You can export data by using the 'Export' button available on most data tables. The system supports exporting to CSV and Excel formats. For more complex exports, use the Reports section.",
  },
  {
    category: "technical",
    question: "What browsers are supported?",
    answer:
      "The system supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend keeping your browser updated to the latest version.",
  },
  {
    category: "technical",
    question: "How do I report a bug?",
    answer:
      "To report a bug, go to the Help & Support section, click 'New Ticket', select 'Technical Problem' as the category, and provide a detailed description of the issue including steps to reproduce it.",
  },
]

// Sample data for recent tickets
const recentTickets = [
  {
    id: "TKT-1001",
    subject: "Cannot access payment reports",
    description:
      "I'm trying to generate the monthly payment report but keep getting an error message saying 'Access Denied'.",
    status: "open",
    date: "2023-03-15T10:30:00",
    updated: "2023-03-15T14:45:00",
  },
  {
    id: "TKT-1002",
    subject: "Application approval emails not sending",
    description:
      "When I approve applications, the system shows success but applicants report not receiving confirmation emails.",
    status: "pending",
    date: "2023-03-10T09:15:00",
    updated: "2023-03-12T11:20:00",
  },
  {
    id: "TKT-1003",
    subject: "Need help with bulk application processing",
    description: "Is there a way to approve multiple applications at once? I have over 50 to process today.",
    status: "closed",
    date: "2023-03-05T14:20:00",
    updated: "2023-03-06T10:30:00",
  },
]

// Sample data for video tutorials
const videoTutorials = [
  {
    title: "Getting Started with the Admin Dashboard",
    duration: "5:32",
  },
  {
    title: "Processing Applications Step by Step",
    duration: "8:17",
  },
  {
    title: "Verifying Payments and Receipts",
    duration: "6:45",
  },
  {
    title: "Managing User Accounts",
    duration: "4:20",
  },
  {
    title: "Generating and Exporting Reports",
    duration: "7:12",
  },
  {
    title: "Troubleshooting Common Issues",
    duration: "9:05",
  },
]

