"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AnimationWrapper from "@/components/animation-wrapper"
import StaggerItem from "@/components/stagger-item"
import ParallaxSection from "@/components/parallax-section"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    success: false,
    error: null,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setStatus({
      submitting: true,
      submitted: false,
      success: false,
      error: null,
    })

    try {
      // This is where you would integrate with your form submission API
      // For example, using Formspree or a custom API endpoint

      // Simulating API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      setStatus({
        submitting: false,
        submitted: true,
        success: true,
        error: null,
      })
    } catch (error) {
      setStatus({
        submitting: false,
        submitted: true,
        success: false,
        error: "There was an error submitting your message. Please try again.",
      })
    }
  }

  return (
    <section id="contact" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white" />

      {/* Decorative background elements with parallax */}
      <ParallaxSection speed={0.15} direction="up">
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl" />
      </ParallaxSection>
      <ParallaxSection speed={0.2} direction="down">
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl" />
      </ParallaxSection>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          <AnimationWrapper variant="fadeInUp" duration={0.7}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-emerald-800">Contact Us</h2>
              <div className="h-1 w-20 bg-emerald-500 mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Have questions about our services or need assistance with your survey pillar application? Get in touch
                with our team and we'll respond as soon as possible.
              </p>
            </div>
          </AnimationWrapper>

          <div className="grid md:grid-cols-2 gap-12">
            <AnimationWrapper variant="fadeInLeft" delay={0.2} duration={0.8}>
              <div className="bg-white rounded-xl shadow-lg p-8 border border-emerald-100 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-6 text-emerald-700">Send Us a Message</h3>

                {status.submitted && status.success && (
                  <Alert className="mb-6 bg-emerald-50 text-emerald-800 border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <AlertDescription>Thank you for your message! We'll get back to you soon.</AlertDescription>
                  </Alert>
                )}

                {status.submitted && !status.success && (
                  <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>{status.error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                      className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your inquiry..."
                      rows={5}
                      required
                      className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={status.submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {status.submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </div>
            </AnimationWrapper>

            <AnimationWrapper variant="fadeInRight" delay={0.3} duration={0.8}>
              <div className="space-y-8">
                <AnimationWrapper variant="staggered" staggerChildren={0.15}>
                  <div>
                    <h3 className="text-xl font-semibold mb-6 text-emerald-700">Contact Information</h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-emerald-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          ),
                          title: "Email",
                          content: "kwaraappsn@gmail.com",
                        },
                        {
                          icon: (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-emerald-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          ),
                          title: "Phone",
                          content: "(234) 0913-755-0602 ",
                        },
                        {
                          icon: (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-emerald-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          ),
                          title: "Address",
                          content: (
                            <>
                              NIS/APPSN Secretariat
                              <br />
                              Ikoyi Avenue, New Yidi Rd
                              <br />
                              Ilorin, Kwara State
                            </>
                          ),
                        },
                      ].map((item, index) => (
                        <StaggerItem key={index}>
                          <div className="flex items-start space-x-4 hover:bg-emerald-50/50 p-3 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700">{item.title}</h4>
                              <p className="text-emerald-600">{item.content}</p>
                            </div>
                          </div>
                        </StaggerItem>
                      ))}
                    </div>
                  </div>
                </AnimationWrapper>

                <AnimationWrapper variant="fadeInUp" delay={0.5} duration={0.7}>
                  <div>
                    <h3 className="text-xl font-semibold mb-6 text-emerald-700">Office Hours</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday:</span>
                        <span className="text-gray-800 font-medium">9:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saturday:</span>
                        <span className="text-gray-800 font-medium">Closed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sunday:</span>
                        <span className="text-gray-800 font-medium">Closed</span>
                      </div>
                    </div>
                  </div>
                </AnimationWrapper>

                <AnimationWrapper variant="fadeInUp" delay={0.6} duration={0.7}>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-emerald-700 mb-2">Need urgent assistance?</h4>
                    <p className="text-gray-600 text-sm">
                      For more information about about Appsn kwara, please contact us at our office or call our support
                      <span className="text-emerald-600 font-medium"> (+234) 0913-755-0602</span>.
                    </p>
                  </div>
                </AnimationWrapper>
              </div>
            </AnimationWrapper>
          </div>
        </div>
      </div>
    </section>
  )
}
