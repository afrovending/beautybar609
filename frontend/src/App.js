import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import axios from "axios";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  MessageCircle,
  Star,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Home as HomeIcon,
  Building2,
  Calendar,
  Clock,
  User,
  Send,
  CheckCircle,
  Award,
  Users,
  Shield,
  Heart,
  Play,
  Quote,
  Crown,
  Zap,
  Gift,
  ArrowRight
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Generate visitor ID for analytics
const getVisitorId = () => {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
};

// Track page view
const trackView = async (section = null) => {
  try {
    await axios.post(`${API}/analytics/track`, {
      page: window.location.pathname,
      section,
      visitor_id: getVisitorId()
    });
  } catch (error) {
    // Silent fail for analytics
  }
};

// Fallback data
const fallbackServices = [
  { id: 1, title: "Nails Extensions", description: "Custom nail art and extensions that make a statement", image: "https://images.unsplash.com/photo-1750598243589-1cc3770356b8?q=85&w=800&auto=format&fit=crop", price: "From ₦15,000" },
  { id: 2, title: "Lashes Extensions", description: "Volume and classic lashes for that perfect flutter", image: "https://images.unsplash.com/photo-1672334115165-f82b6b5e8bee?q=85&w=800&auto=format&fit=crop", price: "From ₦20,000" },
  { id: 3, title: "Brow Tinting & Lamination", description: "Perfectly sculpted brows that frame your face", image: "https://images.unsplash.com/photo-1755274556662-d37485f0677d?q=85&w=800&auto=format&fit=crop", price: "From ₦12,000" },
  { id: 4, title: "Microblading", description: "Semi-permanent brows with natural hair-stroke technique", image: "https://images.unsplash.com/photo-1755223738688-be7501b937d2?q=85&w=800&auto=format&fit=crop", price: "From ₦80,000" }
];

const fallbackPriceList = [
  { category: "NAILS", items: [
    { name: "Gel Extensions (Short)", price: "₦15,000" },
    { name: "Gel Extensions (Medium)", price: "₦18,000" },
    { name: "Gel Extensions (Long)", price: "₦22,000" },
    { name: "Acrylic Full Set", price: "₦25,000" },
  ]},
  { category: "LASHES", items: [
    { name: "Classic Lashes", price: "₦20,000" },
    { name: "Volume Lashes", price: "₦25,000" },
    { name: "Mega Volume", price: "₦30,000" },
  ]},
  { category: "BROWS & BEAUTY", items: [
    { name: "Brow Lamination", price: "₦12,000" },
    { name: "Microblading", price: "₦80,000" },
  ]}
];

const fallbackTestimonials = [
  { id: 1, name: "Amaka O.", text: "Absolutely love my nails! The attention to detail is amazing. Will definitely be back!", rating: 5 },
  { id: 2, name: "Blessing A.", text: "Best lash extensions in Lagos! They last so long and look so natural.", rating: 5 },
  { id: 3, name: "Chidinma E.", text: "My brows have never looked better. The microblading is life-changing!", rating: 5 },
  { id: 4, name: "Damilola F.", text: "Professional service, beautiful results. BeautyBar609 is my new go-to!", rating: 5 },
  { id: 5, name: "Favour N.", text: "The salon is so clean and the staff are so friendly. Highly recommend!", rating: 5 },
];

const fallbackGallery = [
  "https://images.unsplash.com/photo-1594461287652-10b41090cf91?q=85&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516691475576-56cf13710ae9?q=85&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1755274556345-949613163335?q=85&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1750598243589-1cc3770356b8?q=85&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1740484674184-77a7629506a5?q=85&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1672334115165-f82b6b5e8bee?q=85&w=600&auto=format&fit=crop",
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// Navigation Component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navLinks = ["Services", "Gallery", "Prices", "Reviews", "Contact"];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-effect py-2' : 'py-4'}`} data-testid="navigation">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" className="flex items-center" data-testid="logo">
            <img 
              src="/logo.png" 
              alt="BeautyBar609" 
              className="h-14 w-auto"
              onError={(e) => { e.target.src = 'https://customer-assets.emergentagent.com/job_beautybar-preview/artifacts/ybuu6n1s_New%20Logo.png'; }}
            />
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="nav-link text-sm uppercase tracking-widest text-neutral-300 hover:text-gold-400 transition-colors"
                data-testid={`nav-${link.toLowerCase()}`}
              >
                {link}
              </a>
            ))}
            <a
              href="https://wa.me/2348058578131"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-400 text-obsidian font-bold text-sm uppercase tracking-wider px-6 py-3 hover:bg-gold-300 transition-colors"
              data-testid="nav-book-btn"
            >
              Book VIP
            </a>
          </div>

          <button
            className="md:hidden text-gold-400"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-btn"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-effect border-t border-white/10"
          data-testid="mobile-menu"
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm uppercase tracking-widest text-neutral-300 hover:text-gold-400 transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {link}
              </a>
            ))}
            <a
              href="https://wa.me/2348058578131"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-400 text-obsidian font-bold text-sm uppercase tracking-wider px-6 py-3 text-center"
            >
              Book VIP
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

// Authority Hero Section (First Impression Psychology)
const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    trackView('hero');
  }, []);

  return (
    <section id="hero" ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1692318578404-24e9c05b6984?q=85&w=2560&auto=format&fit=crop"
          alt="Beauty background"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* 5-Star Badge */}
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 mb-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-gold-400 text-gold-400" />
              ))}
            </div>
            <span className="text-gold-300 text-sm uppercase tracking-wider">500+ Happy Clients</span>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] text-gold-400 mb-6">
            Premium Beauty Experience
          </motion.p>
          
          {/* Transformation-Focused Headline */}
          <motion.h1 variants={fadeInUp} className="font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
            Flawless Natural Beauty
            <span className="block text-gold-400 mt-2">— Designed Around You</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="font-serif text-lg md:text-xl text-gold-200 italic mb-4">
            The BeautyBar609 Signature Method™
          </motion.p>
          
          <motion.p variants={fadeInUp} className="text-neutral-400 max-w-2xl mx-auto mb-10 text-base">
            Where artistry meets precision. Experience transformations that enhance your natural beauty and boost your confidence.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/2348058578131"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-400 text-obsidian font-bold uppercase tracking-wider px-10 py-5 hover:bg-gold-300 transition-colors duration-300 flex items-center justify-center gap-3 text-lg"
              data-testid="book-vip-btn"
            >
              <Crown size={22} />
              Book VIP Appointment
            </a>
            <a
              href="#transformations"
              className="border-2 border-gold-400 text-gold-400 hover:bg-gold-400/10 uppercase tracking-wider px-10 py-5 transition-all duration-300 flex items-center justify-center gap-2"
              data-testid="see-results-btn"
            >
              See Results
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronRight size={24} className="text-gold-400 rotate-90" />
      </motion.div>
    </section>
  );
};

// Instant Trust Builders Section (Within First 5 Seconds)
const TrustBuilders = () => {
  const stats = [
    { icon: Users, value: "500+", label: "Happy Clients" },
    { icon: Award, value: "5+", label: "Years Experience" },
    { icon: Star, value: "5.0", label: "Google Rating" },
    { icon: Shield, value: "100%", label: "Hygiene Certified" },
  ];

  return (
    <section className="py-8 md:py-12 bg-charcoal border-y border-gold-400/20" data-testid="trust-builders">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="text-center"
              data-testid={`trust-stat-${index}`}
            >
              <stat.icon className="text-gold-400 mx-auto mb-3" size={28} />
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs uppercase tracking-wider text-neutral-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Transformation-Driven Visual Storytelling (Before/After)
const Transformations = () => {
  const transformations = [
    {
      before: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=85&w=400&auto=format&fit=crop",
      after: "https://images.unsplash.com/photo-1594461287652-10b41090cf91?q=85&w=400&auto=format&fit=crop",
      service: "Lash Extensions",
      story: "From sparse lashes to stunning volume"
    },
    {
      before: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=85&w=400&auto=format&fit=crop",
      after: "https://images.unsplash.com/photo-1516691475576-56cf13710ae9?q=85&w=400&auto=format&fit=crop",
      service: "Nail Extensions",
      story: "Natural nails transformed into art"
    },
    {
      before: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=85&w=400&auto=format&fit=crop",
      after: "https://images.unsplash.com/photo-1755274556662-d37485f0677d?q=85&w=400&auto=format&fit=crop",
      service: "Brow Lamination",
      story: "Undefined brows to perfect arches"
    }
  ];

  return (
    <section id="transformations" className="py-20 md:py-28 px-6 md:px-12 bg-obsidian" data-testid="transformations-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <Sparkles size={16} className="text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Real Results</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-5xl text-white mb-4">
            See The <span className="text-gold-400">Transformation</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-neutral-400 max-w-2xl mx-auto">
            Every client leaves feeling more confident. Here's proof of the BeautyBar609 difference.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {transformations.map((item, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group relative bg-charcoal border border-white/5 hover:border-gold-400/50 transition-all duration-500 overflow-hidden"
              data-testid={`transformation-${index}`}
            >
              <div className="grid grid-cols-2">
                <div className="relative">
                  <img src={item.before} alt="Before" className="w-full h-48 object-cover" />
                  <span className="absolute bottom-2 left-2 bg-obsidian/80 px-2 py-1 text-xs uppercase text-neutral-400">Before</span>
                </div>
                <div className="relative">
                  <img src={item.after} alt="After" className="w-full h-48 object-cover" />
                  <span className="absolute bottom-2 right-2 bg-gold-400 px-2 py-1 text-xs uppercase text-obsidian font-bold">After</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl text-white mb-2">{item.service}</h3>
                <p className="text-neutral-400 text-sm">{item.story}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Signature Method Positioning
const SignatureMethod = () => {
  const steps = [
    { icon: Heart, title: "Personal Consultation", desc: "We understand your unique style and preferences" },
    { icon: Sparkles, title: "Custom Design", desc: "Tailored treatment plan for your desired look" },
    { icon: Award, title: "Expert Execution", desc: "Precision application using premium products" },
    { icon: Crown, title: "Lasting Results", desc: "Aftercare guidance for long-lasting beauty" },
  ];

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-charcoal" data-testid="signature-method">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <Crown size={16} className="text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Our Approach</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-5xl text-white mb-4">
            The BeautyBar609 <span className="text-gold-400">Signature Method™</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-neutral-400 max-w-2xl mx-auto">
            Our unique 4-step process ensures every client receives a personalized, luxury experience with results that speak for themselves.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="relative text-center p-8 bg-obsidian border border-white/5 hover:border-gold-400/50 transition-all group"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-400 text-obsidian w-8 h-8 flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <step.icon className="text-gold-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-serif text-lg text-white mb-2">{step.title}</h3>
              <p className="text-neutral-500 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Curated Services Section (Decision Simplification - 3-4 Premium Categories)
const Services = ({ services }) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackView('services');
        }
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById('services');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" className="py-20 md:py-28 px-6 md:px-12 bg-obsidian" data-testid="services-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <Sparkles size={16} className="text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Premium Services</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-5xl text-white mb-4">
            Curated <span className="text-gold-400">Beauty Menu</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-neutral-400 max-w-2xl mx-auto">
            Each service is carefully designed to enhance your natural beauty using premium products and expert techniques.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.slice(0, 4).map((service, index) => (
            <motion.div
              key={service.id || index}
              variants={fadeInUp}
              className="service-card group relative h-[450px] bg-charcoal border border-white/5 hover:border-gold-400/50 transition-colors duration-500 overflow-hidden"
              data-testid={`service-card-${index}`}
            >
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
              <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end">
                <p className="text-xs uppercase tracking-widest text-gold-400 mb-2">{service.price}</p>
                <h3 className="font-serif text-2xl text-white mb-2">{service.title}</h3>
                <p className="text-sm text-neutral-400 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {service.description}
                </p>
                <a
                  href="https://wa.me/2348058578131"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold-400 text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Book Now <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Urgency Message */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 px-6 py-3">
            <Zap size={18} className="text-gold-400" />
            <span className="text-gold-300 text-sm">Appointments fill quickly — Book your spot today!</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Expert Authority Section (Human Trust Psychology)
const ExpertAuthority = () => {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-charcoal" data-testid="expert-authority">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={fadeInUp} className="relative">
            <img
              src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=85&w=600&auto=format&fit=crop"
              alt="BeautyBar609 Expert"
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-gold-400 p-6">
              <p className="text-obsidian font-bold text-4xl">5+</p>
              <p className="text-obsidian text-sm uppercase tracking-wider">Years Expert</p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
              <Award size={16} className="text-gold-400" />
              <span className="text-xs uppercase tracking-widest text-gold-400">Meet The Expert</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
              Passion Meets <span className="text-gold-400">Precision</span>
            </h2>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              At BeautyBar609, we believe every woman deserves to feel confident and beautiful. Our journey started with a simple mission: to provide premium beauty services that enhance natural beauty while delivering an exceptional experience.
            </p>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              With over 5 years of experience and training in the latest techniques, we've perfected our craft to deliver results that exceed expectations. Every treatment is performed with meticulous attention to detail using only premium, certified products.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-gold-400" />
                <span className="text-neutral-300 text-sm">Certified Professional</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-gold-400" />
                <span className="text-neutral-300 text-sm">Premium Products Only</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-gold-400" />
                <span className="text-neutral-300 text-sm">500+ Satisfied Clients</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-gold-400" />
                <span className="text-neutral-300 text-sm">Hygiene Guaranteed</span>
              </div>
            </div>

            <a
              href="https://wa.me/2348058578131"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold-400 text-obsidian font-bold uppercase tracking-wider px-8 py-4 hover:bg-gold-300 transition-colors"
            >
              Book a Consultation
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Gallery Section
const Gallery = ({ images }) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackView('gallery');
        }
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById('gallery');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="gallery" className="py-20 md:py-28 px-6 md:px-12 bg-obsidian" data-testid="gallery-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <Sparkles size={16} className="text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Our Work</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-5xl text-white">
            Portfolio <span className="text-gold-400">Gallery</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {images.map((img, index) => {
            const imgUrl = typeof img === 'string' ? img : img.url;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`gallery-item overflow-hidden ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                data-testid={`gallery-item-${index}`}
              >
                <img
                  src={imgUrl}
                  alt={`Gallery ${index + 1}`}
                  className={`w-full object-cover hover:scale-105 transition-transform duration-500 ${index === 0 ? 'h-full' : 'h-48 md:h-64'}`}
                />
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-8 text-center"
        >
          <a
            href="https://instagram.com/beauty_bar609"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors"
            data-testid="instagram-link"
          >
            <Instagram size={20} />
            <span className="uppercase tracking-wider text-sm">See More on Instagram</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// Social Proof Amplification (Testimonials)
const Testimonials = ({ testimonials }) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackView('reviews');
        }
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById('reviews');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="reviews" className="py-20 md:py-28 bg-charcoal overflow-hidden" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <Star size={16} className="text-gold-400 fill-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Client Love</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-5xl text-white mb-4">
            What Our <span className="text-gold-400">Clients Say</span>
          </motion.h2>
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-gold-400 text-gold-400" />
              ))}
            </div>
            <span className="text-white font-bold">5.0</span>
            <span className="text-neutral-400">on Google Reviews</span>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative">
        <div className="testimonial-track">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[380px] p-8 bg-obsidian border border-white/5"
              data-testid={`testimonial-${index}`}
            >
              <Quote size={32} className="text-gold-400/30 mb-4" />
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="text-neutral-300 mb-6 italic text-lg">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-400 rounded-full flex items-center justify-center">
                  <span className="text-obsidian font-bold">{testimonial.name.charAt(0)}</span>
                </div>
                <p className="text-gold-400 font-medium">{testimonial.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// VIP Membership Funnel
const VIPMembership = () => {
  const benefits = [
    { icon: Crown, title: "Priority Booking", desc: "Skip the queue with exclusive appointment slots" },
    { icon: Gift, title: "Member Pricing", desc: "Enjoy 15% off all services, always" },
    { icon: Sparkles, title: "Free Touch-ups", desc: "Complimentary maintenance sessions included" },
    { icon: Heart, title: "Birthday Treat", desc: "Special discount during your birthday month" },
  ];

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-obsidian" data-testid="vip-membership">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <Crown size={16} className="text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Exclusive</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-5xl text-white mb-4">
            Join the <span className="text-gold-400">VIP Club</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-neutral-400 max-w-2xl mx-auto">
            Become a BeautyBar609 VIP member and enjoy exclusive benefits designed for our most valued clients.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="text-center p-6 bg-charcoal border border-white/5 hover:border-gold-400/50 transition-all"
            >
              <benefit.icon className="text-gold-400 mx-auto mb-4" size={32} />
              <h3 className="font-serif text-lg text-white mb-2">{benefit.title}</h3>
              <p className="text-neutral-500 text-sm">{benefit.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center"
        >
          <a
            href="https://wa.me/2348058578131?text=Hi!%20I'm%20interested%20in%20the%20VIP%20membership"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold-400 text-obsidian font-bold uppercase tracking-wider px-10 py-5 hover:bg-gold-300 transition-colors"
          >
            <Crown size={20} />
            Become a VIP Member
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// Prices Section
const Prices = ({ salonPrices, homePrices }) => {
  const [serviceType, setServiceType] = useState('salon');
  const priceList = serviceType === 'salon' ? salonPrices : homePrices;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackView('prices');
        }
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById('prices');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="prices" className="py-20 md:py-28 px-6 md:px-12 bg-charcoal" data-testid="prices-section">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <Sparkles size={16} className="text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Transparent Pricing</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-5xl text-white">
            Investment in <span className="text-gold-400">Your Beauty</span>
          </motion.h2>
        </motion.div>

        {/* Service Type Toggle */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-obsidian border border-white/10 p-1">
            <button
              onClick={() => setServiceType('salon')}
              className={`flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-wider transition-all ${
                serviceType === 'salon'
                  ? 'bg-gold-400 text-obsidian font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              data-testid="salon-toggle"
            >
              <Building2 size={18} />
              Salon
            </button>
            <button
              onClick={() => setServiceType('home')}
              className={`flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-wider transition-all ${
                serviceType === 'home'
                  ? 'bg-gold-400 text-obsidian font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              data-testid="home-toggle"
            >
              <HomeIcon size={18} />
              Home Service
            </button>
          </div>
        </motion.div>

        {serviceType === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gold-400/10 border border-gold-400/30 p-4 mb-8 text-center"
          >
            <p className="text-gold-300 text-sm">
              <HomeIcon size={16} className="inline mr-2" />
              Home service prices include transport within Lagos. We come to you!
            </p>
          </motion.div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="space-y-12"
        >
          <AnimatePresence mode="wait">
            {priceList.map((category, catIndex) => (
              <motion.div 
                key={`${serviceType}-${catIndex}`} 
                variants={fadeInUp} 
                data-testid={`price-category-${catIndex}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-serif text-xl text-gold-400 mb-6 pb-2 border-b border-gold-400/20">
                  {category.category}
                </h3>
                <div className="space-y-0">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="price-row flex justify-between items-center py-4 border-b border-white/5"
                      data-testid={`price-item-${catIndex}-${itemIndex}`}
                    >
                      <span className="text-neutral-300">{item.name}</span>
                      <span className="text-gold-300 font-medium">{item.price}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center text-neutral-500 text-sm mt-12"
        >
          * Prices may vary based on design complexity. Contact us for custom quotes.
        </motion.p>
      </div>
    </section>
  );
};

// Home Booking Form
const HomeBookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    service: '',
    preferred_date: '',
    preferred_time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const services = [
    "Gel Extensions (Short)",
    "Gel Extensions (Medium)", 
    "Gel Extensions (Long)",
    "Acrylic Full Set",
    "Gel Polish Only",
    "Classic Lashes",
    "Volume Lashes",
    "Mega Volume",
    "Lash Lift & Tint",
    "Brow Lamination",
    "Brow Tint",
    "Microblading",
    "Microshading"
  ];

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/bookings/home`, formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="book-home" className="py-20 md:py-28 px-6 md:px-12 bg-obsidian" data-testid="home-booking-success">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gold-400 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-obsidian" />
          </motion.div>
          <h2 className="font-serif text-3xl text-white mb-4">Booking Submitted!</h2>
          <p className="text-neutral-400 mb-8">
            We've received your home service request. We'll contact you shortly to confirm your appointment.
          </p>
          <button
            onClick={() => { setSubmitted(false); setFormData({ name: '', phone: '', email: '', address: '', service: '', preferred_date: '', preferred_time: '', notes: '' }); }}
            className="text-gold-400 hover:text-gold-300 underline"
          >
            Book Another Service
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="book-home" className="py-20 md:py-28 px-6 md:px-12 bg-obsidian" data-testid="home-booking-section">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <HomeIcon size={16} className="text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Convenience</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-5xl text-white mb-4">
            Book <span className="text-gold-400">Home Service</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-neutral-400">
            We bring the luxury salon experience to your doorstep
          </motion.p>
        </motion.div>

        <motion.form
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          onSubmit={handleSubmit}
          className="bg-charcoal border border-white/10 p-8"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gold-400 mb-2">
                <User size={14} className="inline mr-2" />
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                placeholder="Enter your name"
                data-testid="booking-name-input"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gold-400 mb-2">
                <Phone size={14} className="inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                placeholder="e.g., 0805 857 8131"
                data-testid="booking-phone-input"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gold-400 mb-2">
                <Mail size={14} className="inline mr-2" />
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                placeholder="your@email.com"
                data-testid="booking-email-input"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gold-400 mb-2">
                <Sparkles size={14} className="inline mr-2" />
                Service *
              </label>
              <select
                required
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                data-testid="booking-service-select"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gold-400 mb-2">
                <Calendar size={14} className="inline mr-2" />
                Preferred Date *
              </label>
              <input
                type="date"
                required
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                data-testid="booking-date-input"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gold-400 mb-2">
                <Clock size={14} className="inline mr-2" />
                Preferred Time *
              </label>
              <select
                required
                value={formData.preferred_time}
                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                data-testid="booking-time-select"
              >
                <option value="">Select time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gold-400 mb-2">
                <MapPin size={14} className="inline mr-2" />
                Your Address *
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors min-h-[100px]"
                placeholder="Enter your full address (street, area, landmark)"
                data-testid="booking-address-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gold-400 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                placeholder="Any special requests or details"
                data-testid="booking-notes-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-gold-400 text-obsidian font-bold uppercase tracking-wider py-4 hover:bg-gold-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="booking-submit-btn"
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send size={18} />
                Submit Booking Request
              </>
            )}
          </button>

          <p className="text-neutral-500 text-sm text-center mt-4">
            We'll confirm your appointment via phone/WhatsApp within 24 hours
          </p>
        </motion.form>
      </div>
    </section>
  );
};

// Final Conversion Block
const FinalCTA = () => {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-obsidian relative overflow-hidden" data-testid="final-cta">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=85&w=1920&auto=format&fit=crop"
          alt="Beauty background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/90 to-obsidian/80" />
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <Sparkles size={16} className="text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Start Your Journey</span>
          </motion.div>
          
          <motion.h2 variants={fadeInUp} className="font-serif text-4xl md:text-6xl text-white mb-6">
            Your <span className="text-gold-400">Glow-Up</span> Starts Today
          </motion.h2>
          
          <motion.p variants={fadeInUp} className="text-neutral-400 text-lg max-w-2xl mx-auto mb-10">
            Join hundreds of satisfied clients who have transformed their look with BeautyBar609. Book your appointment now and experience the difference.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/2348058578131"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-400 text-obsidian font-bold uppercase tracking-wider px-12 py-5 hover:bg-gold-300 transition-colors duration-300 flex items-center justify-center gap-3 text-lg"
              data-testid="final-book-btn"
            >
              <MessageCircle size={24} />
              Book Now on WhatsApp
            </a>
            <a
              href="tel:+2348058578131"
              className="border-2 border-gold-400 text-gold-400 hover:bg-gold-400/10 uppercase tracking-wider px-12 py-5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Call Us
            </a>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-10 flex items-center justify-center gap-6 text-neutral-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-gold-400" />
              <span>Hygiene Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-gold-400" />
              <span>5+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-gold-400 fill-gold-400" />
              <span>500+ Happy Clients</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Contact Section
const Contact = () => {
  const contactInfo = [
    { icon: MessageCircle, label: "WhatsApp", value: "0805 857 8131", href: "https://wa.me/2348058578131" },
    { icon: Phone, label: "Phone", value: "0905 995 2338", href: "tel:+2349059952338" },
    { icon: Mail, label: "Email", value: "info@beautybar609.com", href: "mailto:info@beautybar609.com" },
    { icon: MapPin, label: "Address", value: "57, Arowolo Street, Off Agbe Road, Abule Egba", href: "https://maps.google.com/?q=Arowolo+Street+Abule+Egba+Lagos" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackView('contact');
        }
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById('contact');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="py-20 md:py-28 px-6 md:px-12 bg-charcoal" data-testid="contact-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-gold-400/10 px-4 py-2 mb-6">
            <MapPin size={16} className="text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400">Visit Us</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl md:text-5xl text-white">
            Get In <span className="text-gold-400">Touch</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {contactInfo.map((info, index) => (
            <motion.a
              key={index}
              href={info.href}
              target={info.label === "Address" || info.label === "WhatsApp" ? "_blank" : undefined}
              rel="noopener noreferrer"
              variants={fadeInUp}
              className="group p-6 bg-obsidian border border-white/5 hover:border-gold-400/50 transition-colors duration-500 text-center"
              data-testid={`contact-${info.label.toLowerCase()}`}
            >
              <info.icon className="text-gold-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={28} />
              <p className="text-xs uppercase tracking-widest text-gold-400 mb-2">{info.label}</p>
              <p className="text-neutral-300">{info.value}</p>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// WhatsApp Floating Button
const WhatsAppFloat = () => {
  return (
    <motion.a
      href="https://wa.me/2348058578131?text=Hi!%20I'd%20like%20to%20book%20an%20appointment%20at%20BeautyBar609"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      data-testid="whatsapp-float-btn"
    >
      <MessageCircle size={28} fill="white" />
      <span className="absolute -top-2 -right-2 bg-gold-400 text-obsidian text-xs font-bold px-2 py-1 rounded-full animate-pulse">
        Chat
      </span>
    </motion.a>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="py-12 px-6 md:px-12 bg-obsidian border-t border-white/5" data-testid="footer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <img 
              src="/logo.png" 
              alt="BeautyBar609" 
              className="h-20 w-auto mx-auto md:mx-0"
              onError={(e) => { e.target.src = 'https://customer-assets.emergentagent.com/job_beautybar-preview/artifacts/ybuu6n1s_New%20Logo.png'; }}
            />
          </div>

          <div className="flex gap-6">
            <a
              href="https://instagram.com/beauty_bar609"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon text-neutral-400"
              data-testid="footer-instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://tiktok.com/@Beautybar609"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon text-neutral-400"
              data-testid="footer-tiktok"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/2348058578131"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon text-neutral-400"
              data-testid="footer-whatsapp"
            >
              <MessageCircle size={24} />
            </a>
          </div>
        </div>

        <div className="gold-line mt-8 mb-6" />

        <p className="text-center text-neutral-600 text-sm">
          © {new Date().getFullYear()} BeautyBar609. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// Main Home Page with data fetching
const Home = () => {
  const [services, setServices] = useState(fallbackServices);
  const [salonPrices, setSalonPrices] = useState(fallbackPriceList);
  const [homePrices, setHomePrices] = useState([]);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [gallery, setGallery] = useState(fallbackGallery);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, salonPricesRes, homePricesRes, testimonialsRes, galleryRes] = await Promise.all([
          axios.get(`${API}/services`).catch(() => ({ data: [] })),
          axios.get(`${API}/prices?service_type=salon`).catch(() => ({ data: [] })),
          axios.get(`${API}/prices?service_type=home`).catch(() => ({ data: [] })),
          axios.get(`${API}/testimonials`).catch(() => ({ data: [] })),
          axios.get(`${API}/gallery`).catch(() => ({ data: [] })),
        ]);

        if (servicesRes.data?.length) setServices(servicesRes.data);
        if (salonPricesRes.data?.length) setSalonPrices(salonPricesRes.data);
        if (homePricesRes.data?.length) setHomePrices(homePricesRes.data);
        if (testimonialsRes.data?.length) setTestimonials(testimonialsRes.data);
        if (galleryRes.data?.length) setGallery(galleryRes.data);
      } catch (error) {
        console.log('Using fallback data');
      }
    };

    fetchData();
    trackView('page_load');
  }, []);

  return (
    <div className="bg-obsidian min-h-screen" data-testid="home-page">
      <Navigation />
      <Hero />
      <TrustBuilders />
      <Transformations />
      <SignatureMethod />
      <Services services={services} />
      <ExpertAuthority />
      <Gallery images={gallery} />
      <Testimonials testimonials={testimonials} />
      <VIPMembership />
      <Prices salonPrices={salonPrices} homePrices={homePrices.length ? homePrices : salonPrices} />
      <HomeBookingForm />
      <FinalCTA />
      <Contact />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
