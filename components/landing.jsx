import Image from "next/image"
import Link from "next/link"
import Process from "@/components/process"
import Main from "@/components/home"
import Navi from "@/components/navi"
import ContactForm from "@/components/contact-form"
import AnimationWrapper from "@/components/animation-wrapper"
import {
 
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react"
import ParallaxSection from "@/components/parallax-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Navi />
     
      <div className="absolute top-0 left-0 w-full h-[1200px] pointer-events-none overflow-hidden">
       
        <ParallaxSection speed={0.1} direction="up">
          <div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-emerald-200 via-teal-200 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"
            style={{ animationDuration: "15s" }}
          />
        </ParallaxSection>
        <ParallaxSection speed={0.15} direction="down">
          <div
            className="absolute top-40 right-1/4 w-[700px] h-[700px] bg-gradient-to-l from-blue-200 via-emerald-200 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"
            style={{ animationDuration: "20s" }}
          />
        </ParallaxSection>

        {/* Additional subtle elements */}
        <ParallaxSection speed={0.2} direction="up">
          <div className="absolute top-[30%] left-[10%] w-[300px] h-[300px] bg-teal-100 rounded-full blur-3xl opacity-10 animate-float" />
        </ParallaxSection>
        <ParallaxSection speed={0.25} direction="down">
          <div className="absolute top-[60%] right-[15%] w-[250px] h-[250px] bg-emerald-100 rounded-full blur-3xl opacity-10 animate-pulse-slow" />
        </ParallaxSection>

        {/* Decorative dots pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <main>
        <Main />
        
        {/* Updated dashboard image section for a more modern look */}
        <section className="relative py-16">
          <div className="container mx-auto px-4">
            <AnimationWrapper variant="fadeInUp" duration={0.8}>
              <div className="relative mx-auto max-w-6xl">
                {/* Updated gradient background with more depth */}
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-100 via-blue-100 to-teal-100 rounded-xl blur-xl opacity-50" />
                <div className="relative rounded-xl border bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden group transition-all duration-500 hover:shadow-emerald-200/30">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-100/80 to-white/80 opacity-90" />
                  <div className="relative z-10 p-2">
                    <Image
                      src="/bg.jpg"
                      width={1200}
                      height={600}
                      alt="Survey Application Dashboard"
                      className="rounded-lg relative z-10 transform transition-transform duration-700 group-hover:scale-[1.02]"
                      priority
                    />
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-bl-full z-0" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-tr-full z-0" />
                </div>
              </div>
            </AnimationWrapper>
          </div>
        </section>


        <Process />

        {/* Added About Section */}
        

        {/* Added Contact Form Section */}
        <ContactForm />
      </main>

      {/* Updated footer with new color scheme */}
      <footer className="relative bg-emerald-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-950/20" />
        {/* Decorative wave pattern */}
        <div className="absolute top-0 left-0 w-full h-12 overflow-hidden">
          <svg
            className="absolute bottom-0 w-full h-12 fill-emerald-900"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
        <div className="relative py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <AnimationWrapper variant="fadeInUp" duration={0.8}>
                <div className="grid md:grid-cols-4 gap-12">
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <Image
                        src="/appsn1.png"
                        alt="NIS Logo"
                        width={40}
                        height={40}
                        className="w-10 h-10 brightness-0 invert"
                      />
                      <span className="font-bold text-xl">APPSN KWARA</span>
                    </div>
                    <p className="text-emerald-100 text-sm leading-relaxed">
                      Association Of Private Practising Surveyor Of Nigeria (APPSN)
                      <br />A Subgroup Of The Nigerian Institution Of Surveyors (NIS)
                      <br />
                      KWARA STATE BRANCH
                    </p>
                    {/* Social media icons */}
                    <div className="flex space-x-4 mt-6">
                      <a
                        href="#"
                        className="w-9 h-9 rounded-full bg-emerald-800/50 flex items-center justify-center hover:bg-emerald-700/50 transition-colors"
                      >
                        <span className="sr-only">Facebook</span>
                        <Facebook className="w-4 h-4 text-white" />
                      </a>
                      <a
                        href="#"
                        className="w-9 h-9 rounded-full bg-emerald-800/50 flex items-center justify-center hover:bg-emerald-700/50 transition-colors"
                      >
                        <span className="sr-only">Twitter</span>
                        <Twitter className="w-4 h-4 text-white" />
                      </a>
                      <a
                        href="#"
                        className="w-9 h-9 rounded-full bg-emerald-800/50 flex items-center justify-center hover:bg-emerald-700/50 transition-colors"
                      >
                        <span className="sr-only">Instagram</span>
                        <Instagram className="w-4 h-4 text-white" />
                      </a>
                      <a
                        href="#"
                        className="w-9 h-9 rounded-full bg-emerald-800/50 flex items-center justify-center hover:bg-emerald-700/50 transition-colors"
                      >
                        <span className="sr-only">LinkedIn</span>
                        <Linkedin className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-6 text-white text-lg">Services</h4>
                    <ul className="space-y-3 text-emerald-100 text-sm">
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Route Surveys
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Cadastral/Boundary Surveys
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Engineering Surveys
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Hydrography Surveys
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Digital Mapping
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Deformation Survey and Analysis
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> GIS Services
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Land Information
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-6 text-white text-lg">APPSN KWARA</h4>
                    <ul className="space-y-3 text-emerald-100 text-sm">
                      <li>
                        <Link href="#about" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> About Us
                        </Link>
                      </li>
                      <li>
                        <Link href="#contact" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Contact
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-white transition-colors inline-flex items-center">
                          <span className="mr-2">→</span> Terms of Service
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-6 text-white text-lg">Contact</h4>
                    <ul className="space-y-4 text-emerald-100 text-sm">
                      <li className="flex items-start">
                        <Mail className="mr-3 mt-1 w-4 h-4" />
                        <span>Email: kwaraappsn@gmail.com</span>
                      </li>
                      <li className="flex items-start">
                        <Phone className="mr-3 mt-1 w-4 h-4" />
                        <span>Phone: (+234) 913-755-0602 </span>
                      </li>
                      <li className="flex items-start">
                        <MapPin className="mr-3 mt-1 w-4 h-4" />
                        <span>Address: NIS Secretariat Ikoyi Avenue, New Yidi Rd Ilorin</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </AnimationWrapper>
              <div className="mt-16 pt-8 border-t border-emerald-800/50 text-center text-sm text-emerald-100">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p>
                    &copy; {new Date().getFullYear()} ASSOCIATION OF PRIVATE PRACTISING SURVEYOR OF NIGERIA (APPSN)
                    KWARA STATE BRANCH
                  </p>
                  <p className="mt-2 md:mt-0">All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
