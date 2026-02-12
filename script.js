const { useState, useEffect } = React;

const App = () => {
    const [trackId, setTrackId] = useState('');
    const [form, setForm] = useState({ name: '', phone: '', pickup: '', destination: '', type: '' });

    useEffect(() => {
        lucide.createIcons();
    }, []);

    const handleWhatsApp = (type) => {
        let text = "";
        if (type === 'track') {
            if (!trackId) return alert("Please enter a tracking number");
            text = `Hello Sky Express! I'd like to track my shipment ID: ${trackId}`;
        } else {
            if (!form.name || !form.phone) return alert("Please fill Name and Phone");
            text = `*New Pickup Request*\n\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Pickup:* ${form.pickup}\n*Destination:* ${form.destination}\n*Service:* ${form.type}`;
        }
        window.open(`https://wa.me/918121592299?text=${encodeURIComponent(text)}`, "_blank");
    };

    return (
        <div className="relative">
            {/* Header */}
            <nav className="fixed w-full z-50 glass-nav border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-2xl font-black text-slate-900 tracking-tighter italic">
                        SKY<span className="text-blue-600">EXPRESS</span>
                    </div>
                    <div className="hidden md:flex space-x-8 text-sm font-bold text-slate-600">
                        <a href="#services" className="hover:text-blue-600 transition">SERVICES</a>
                        <a href="#pickup" className="hover:text-blue-600 transition">BOOKING</a>
                        <a href="#contact" className="hover:text-blue-600 transition">CONTACT</a>
                    </div>
                    <a href="tel:+918121592299" className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-red-200 flex items-center gap-2 hover:bg-red-700 transition">
                        <i data-lucide="phone-call" className="w-4 h-4"></i> CALL NOW
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-gradient h-screen flex items-center px-6">
                <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center text-white">
                    <div>
                        <span className="bg-blue-600 text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase mb-6 inline-block">Premium Logistics Hub</span>
                        <h1 className="text-6xl md:text-8xl font-extrabold leading-none mb-6">World Class <br/><span className="text-blue-400 italic">Delivery.</span></h1>
                        <p className="text-lg text-slate-300 mb-10 max-w-md">The most trusted International and Domestic courier partner in Visakhapatnam.</p>
                        
                        <div className="bg-white p-2 rounded-2xl flex flex-col sm:flex-row gap-2 max-w-md shadow-2xl">
                            <input 
                                className="flex-1 px-6 py-4 text-slate-900 outline-none font-semibold rounded-xl"
                                placeholder="Enter Tracking ID..."
                                onChange={(e) => setTrackId(e.target.value)}
                            />
                            <button onClick={() => handleWhatsApp('track')} className="bg-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition uppercase tracking-widest text-xs">Track</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Services Grid */}
            <section id="services" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-10">
                    {[
                        { title: "Global Express", icon: "globe", text: "Door-to-door international delivery to over 220 countries." },
                        { title: "Domestic Priority", icon: "truck", text: "Fastest surface and air networks across all Indian states." },
                        { title: "Secure Cargo", icon: "shield-check", text: "Heavy shipment handling with multi-layer safety packing." }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-12 rounded-[2.5rem] border border-slate-100 card-hover">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                                <i data-lucide={s.icon}></i>
                            </div>
                            <h3 className="text-2xl font-black mb-4 tracking-tight">{s.title}</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pickup Form Section */}
            <section id="pickup" className="py-32 bg-slate-900 px-6">
                <div className="max-w-5xl mx-auto bg-white rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-3xl">
                    <div className="bg-blue-600 p-16 md:w-2/5 text-white flex flex-col justify-center">
                        <h2 className="text-4xl font-black mb-6 italic leading-none">Book a <br/>Pickup</h2>
                        <p className="text-blue-100 mb-8 text-sm leading-relaxed">Schedule a doorstep collection anywhere in Vizag with one click.</p>
                        <div className="space-y-4 text-xs font-bold tracking-widest opacity-70 uppercase">
                            <div className="flex items-center gap-3"><i data-lucide="check-circle" className="w-4 h-4"></i> Real-time tracking</div>
                            <div className="flex items-center gap-3"><i data-lucide="check-circle" className="w-4 h-4"></i> Professional packing</div>
                        </div>
                    </div>
                    <div className="p-16 md:w-3/5">
                        <form className="grid gap-6">
                            <input className="border-b-2 border-slate-100 p-3 outline-none focus:border-blue-600 transition" placeholder="Full Name *" onChange={(e) => setForm({...form, name: e.target.value})} />
                            <input className="border-b-2 border-slate-100 p-3 outline-none focus:border-blue-600 transition" placeholder="Phone Number *" onChange={(e) => setForm({...form, phone: e.target.value})} />
                            <input className="border-b-2 border-slate-100 p-3 outline-none focus:border-blue-600 transition" placeholder="Pickup Location *" onChange={(e) => setForm({...form, pickup: e.target.value})} />
                            <input className="border-b-2 border-slate-100 p-3 outline-none focus:border-blue-600 transition" placeholder="Destination City *" onChange={(e) => setForm({...form, destination: e.target.value})} />
                            <button 
                                onClick={(e) => { e.preventDefault(); handleWhatsApp('pickup'); }}
                                className="bg-red-600 text-white py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:bg-red-700 transition shadow-xl shadow-red-100 mt-4"
                            >
                                Confirm via WhatsApp
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Contact & Map */}
            <footer id="contact" className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16 mb-24">
                    <div>
                        <h4 className="font-black text-xs tracking-widest uppercase text-slate-400 mb-8">Head Office</h4>
                        <p className="text-xl font-bold text-slate-900 leading-tight">Plot No: 5, Old Dairy Farm, <br/>Visakhapatnam – 530040</p>
                    </div>
                    <div>
                        <h4 className="font-black text-xs tracking-widest uppercase text-slate-400 mb-8">Direct Contact</h4>
                        <p className="text-xl font-bold text-blue-600 underline">+91 81215 92299</p>
                        <p className="text-sm text-slate-500 font-bold mt-2">skyexpress.vskp@gmail.com</p>
                    </div>
                    <div>
                        <h4 className="font-black text-xs tracking-widest uppercase text-slate-400 mb-8">Working Hours</h4>
                        <p className="text-sm font-bold text-slate-900">Mon - Sat: 09:00 AM - 08:00 PM</p>
                        <p className="text-sm font-bold text-red-500 mt-1">Sunday: Closed</p>
                    </div>
                </div>

                {/* Map */}
                <div className="max-w-7xl mx-auto h-[400px] rounded-[3rem] overflow-hidden border-8 border-slate-50 grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3800.0658826555194!2d83.3156686!3d17.7415448!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a39436155555555%3A0x7d6c6e76e568d44e!2sSky%20Express%20International%20Couriers!5e0!3m2!1sen!2sin!4v1715600000000!5m2!1sen!2sin" width="100%" height="100%" loading="lazy"></iframe>
                </div>

                <div className="mt-24 text-center text-[10px] font-black tracking-[0.5em] text-slate-300 uppercase italic">
                    Sky Express International | Excellence in Motion
                </div>
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
