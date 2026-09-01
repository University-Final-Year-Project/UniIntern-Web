import { Link } from 'react-router-dom';
import {
  Sparkles,
  Building2,
  TrendingUp,
  Check,
  Users,
  FileText,
  Settings,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-navy/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <div className="inline-block bg-teal/20 border border-teal/40 text-teal text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
              NOW LIVE: 2026 
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Bridge the gap between{' '}
              <span className="text-teal">talent</span> and{' '}
              <em className="not-italic text-white">opportunity.</em>
            </h1>
            <p className="text-lg text-white/75 mb-8 leading-relaxed max-w-lg">
              The premier career ecosystem where university ambition meets
              corporate excellence. Powered by AI, designed for the next
              generation.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/choose-role"
                className="bg-teal text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-dark transition-colors flex items-center gap-2">
                <span>Get Started</span>
                <ArrowRight className="size-4" />
              </Link>
              <button className="text-white font-medium text-sm hover:text-teal transition-colors">
                View Case Studies
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* For Future Leaders */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold text-teal tracking-widest uppercase mb-3">
                For Future Leaders
              </p>
              <h2 className="text-4xl font-bold text-navy mb-10 leading-tight">
                Accelerate your trajectory.
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center mb-3">
                    <Sparkles className="size-5 text-teal" />
                  </div>
                  <h3 className="font-bold text-navy mb-2">AI Matching</h3>
                  <p className="text-sm text-gray-500 leading-5">
                    Our neural engine aligns your specific skill sets and
                    academic background with the perfect roles.
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center mb-3">
                    <Building2 className="size-5 text-teal" />
                  </div>
                  <h3 className="font-bold text-navy mb-2">Elite Internships</h3>
                  <p className="text-sm text-gray-500 leading-5">
                    Access exclusive openings from Fortune 500 companies and
                    high-growth tech startups.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="size-5 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy mb-1">Career Growth</h3>
                    <p className="text-sm text-gray-500 leading-5">
                      Beyond placement. Get personalized roadmaps, interview
                      prep, and mentorship from industry veterans.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80"
                alt="Student"
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="absolute bottom-6 left-6 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
                  <Check className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy">Success Story</p>
                  <p className="text-xs text-gray-500">Placed at Google, Summer '24</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hire with Intelligence */}
      <section className="py-20 px-6 bg-navy">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left: Top Candidates Card */}
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <p className="text-white font-semibold text-sm">Top Candidates</p>
                <button className="text-teal text-xs font-semibold">View All</button>
              </div>
              {[92, 88, 75].map((score, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/20" />
                  <div className="flex-1 h-2 bg-white/10 rounded-full">
                    <div
                      className="h-full bg-teal rounded-full"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-teal">{score}%</span>
                </div>
              ))}
              <div className="mt-4 bg-white/5 rounded-xl p-4 flex items-center justify-center border border-white/10">
                <FileText className="size-6 text-white/40" />
              </div>
            </div>

            {/* Right: Features */}
            <div>
              <p className="text-xs font-bold text-teal tracking-widest uppercase mb-3">
                For Talent Acquisition
              </p>
              <h2 className="text-4xl font-bold text-white mb-10 leading-tight">
                Hire with intelligence.
              </h2>

              <div className="space-y-6 mb-10">
                {[
                  {
                    icon: Users,
                    title: 'Precision Sourcing',
                    desc: 'Connect with students from top-tier universities globally using granular skill filtering.',
                  },
                  {
                    icon: FileText,
                    title: 'AI Summaries',
                    desc: 'Review thousands of applications in minutes with automated candidate fit scoring and profile highlights.',
                  },
                  {
                    icon: Settings,
                    title: 'Enterprise Management',
                    desc: 'A centralized dashboard to manage listings, track interviews, and collaborate with your hiring team.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-white/60 leading-5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/company/register"
                className="inline-block bg-teal text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-dark transition-colors">
                Join as a Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to start */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-navy mb-3">
            Ready to start your journey?
          </h2>
          <p className="text-gray-500 mb-12">
            Select your path below to begin your personalized UniIntern experience.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link
              to="/student/login"
              className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow text-left group">
              <div className="w-12 h-12 bg-teal-light rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="size-6 text-teal" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">I'm a Student</h3>
              <p className="text-sm text-gray-500 leading-5 mb-4">
                Discover roles, build your profile, and launch your career with
                AI-driven insights.
              </p>
              <span className="text-teal text-sm font-semibold group-hover:underline flex items-center gap-1">
                <span>Explore Internships</span>
                <ArrowRight className="size-4" />
              </span>
            </Link>

            <Link
              to="/company/login"
              className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow text-left group">
              <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="size-6 text-navy" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">I'm a Recruiter</h3>
              <p className="text-sm text-gray-500 leading-5 mb-4">
                Find top-tier university talent and streamline your entire
                internship program.
              </p>
              <span className="text-teal text-sm font-semibold group-hover:underline flex items-center gap-1">
                <span>Post a Listing</span>
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Join the Career Circle */}
      <section className="py-16 px-6 bg-navy">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Join the Career Circle.
            </h2>
            <p className="text-white/60 text-sm max-w-sm">
              Get weekly career advice, early access to top listings, and
              invitations to exclusive networking events.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your university email"
              className="flex-1 md:w-72 px-4 py-3 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-teal"
            />
            <button className="bg-teal text-white font-semibold px-5 py-3 rounded-lg hover:bg-teal-dark transition-colors text-sm">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">U</span>
            </div>
            <span className="text-navy font-bold">UniIntern</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-navy transition-colors">Terms</a>
            <a href="#" className="text-sm text-gray-400 hover:text-navy transition-colors">Privacy</a>
            <a href="#" className="text-sm text-gray-400 hover:text-navy transition-colors">Contact</a>
          </div>
          <p className="text-xs text-gray-400">
            © 2024 UniIntern Career Portal. Empowering the next generation of professionals.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;