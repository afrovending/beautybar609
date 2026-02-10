import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  LayoutDashboard,
  Scissors,
  DollarSign,
  MessageSquare,
  Gift,
  Image,
  BarChart3,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Upload,
  Star,
  Menu,
  ChevronLeft
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, onLogout, isMobileOpen, setIsMobileOpen }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'prices', label: 'Price List', icon: DollarSign },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'promotions', label: 'Promotions', icon: Gift },
    { id: 'gallery', label: 'Gallery', icon: Image },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-charcoal border-r border-white/10 transform transition-transform lg:transform-none ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-gold-400">BeautyBar609</h2>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Admin Panel</p>
          </div>
          <button 
            className="lg:hidden text-neutral-400"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-gold-400/10 text-gold-400 border-l-2 border-gold-400'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon size={18} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-400 transition-colors"
            data-testid="logout-btn"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Overview Tab
const OverviewTab = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/summary`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-neutral-400">Loading analytics...</div>;
  }

  const stats = [
    { label: 'Total Views', value: analytics?.total_views || 0, icon: BarChart3 },
    { label: 'Today', value: analytics?.today_views || 0, icon: BarChart3 },
    { label: 'This Week', value: analytics?.week_views || 0, icon: BarChart3 },
    { label: 'Unique Visitors', value: analytics?.unique_visitors || 0, icon: BarChart3 },
  ];

  return (
    <div data-testid="overview-tab">
      <h2 className="font-serif text-2xl text-gold-100 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-charcoal border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={20} className="text-gold-400" />
              <span className="text-xs uppercase tracking-wider text-neutral-500">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Views Chart */}
        <div className="bg-charcoal border border-white/10 p-6">
          <h3 className="text-lg text-gold-400 mb-4">Last 7 Days</h3>
          <div className="space-y-3">
            {analytics?.daily_views?.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-neutral-500 text-sm w-24">{day.date}</span>
                <div className="flex-1 bg-obsidian h-6 overflow-hidden">
                  <div 
                    className="h-full bg-gold-400/30"
                    style={{ width: `${Math.min((day.views / Math.max(...analytics.daily_views.map(d => d.views), 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-white text-sm w-12 text-right">{day.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Sections */}
        <div className="bg-charcoal border border-white/10 p-6">
          <h3 className="text-lg text-gold-400 mb-4">Popular Sections</h3>
          {analytics?.popular_sections?.length > 0 ? (
            <div className="space-y-3">
              {analytics.popular_sections.map((section, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-neutral-300 capitalize">{section.section}</span>
                  <span className="text-gold-400">{section.views} views</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No section data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Services Tab
const ServicesTab = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', image: '', price: '', order: 0 });

  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await axios.post(`${API}/services`, formData);
      } else {
        await axios.put(`${API}/services/${editingId}`, formData);
      }
      setEditingId(null);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`${API}/services/${id}`);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      description: service.description,
      image: service.image,
      price: service.price,
      order: service.order || 0
    });
  };

  const startNew = () => {
    setEditingId('new');
    setFormData({ title: '', description: '', image: '', price: '', order: services.length });
  };

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  return (
    <div data-testid="services-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-gold-100">Services</h2>
        <button
          onClick={startNew}
          className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300 transition-colors"
          data-testid="add-service-btn"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {editingId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal border border-gold-400/50 p-6 mb-6"
        >
          <h3 className="text-gold-400 mb-4">{editingId === 'new' ? 'New Service' : 'Edit Service'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none"
              data-testid="service-title-input"
            />
            <input
              type="text"
              placeholder="Price (e.g., From ₦15,000)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none"
              data-testid="service-price-input"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none md:col-span-2"
              data-testid="service-image-input"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none md:col-span-2 min-h-[100px]"
              data-testid="service-description-input"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300"
              data-testid="save-service-btn"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="flex items-center gap-2 border border-white/20 text-neutral-400 px-4 py-2 text-sm hover:border-white/40"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-charcoal border border-white/10 p-4 flex items-center gap-4">
            <img src={service.image} alt={service.title} className="w-20 h-20 object-cover" />
            <div className="flex-1">
              <h4 className="text-white font-medium">{service.title}</h4>
              <p className="text-gold-400 text-sm">{service.price}</p>
              <p className="text-neutral-500 text-sm truncate">{service.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(service)}
                className="p-2 text-neutral-400 hover:text-gold-400"
                data-testid={`edit-service-${service.id}`}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="p-2 text-neutral-400 hover:text-red-400"
                data-testid={`delete-service-${service.id}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Prices Tab
const PricesTab = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ category: '', items: [], order: 0 });
  const [newItem, setNewItem] = useState({ name: '', price: '' });

  const fetchPrices = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/prices`);
      setPrices(response.data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await axios.post(`${API}/prices`, formData);
      } else {
        await axios.put(`${API}/prices/${editingId}`, formData);
      }
      setEditingId(null);
      fetchPrices();
    } catch (error) {
      console.error('Error saving prices:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${API}/prices/${id}`);
        fetchPrices();
      } catch (error) {
        console.error('Error deleting price category:', error);
      }
    }
  };

  const addItem = () => {
    if (newItem.name && newItem.price) {
      setFormData({ ...formData, items: [...formData.items, { ...newItem }] });
      setNewItem({ name: '', price: '' });
    }
  };

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const startEdit = (priceCategory) => {
    setEditingId(priceCategory.id);
    setFormData({
      category: priceCategory.category,
      items: priceCategory.items || [],
      order: priceCategory.order || 0
    });
  };

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  return (
    <div data-testid="prices-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-gold-100">Price List</h2>
        <button
          onClick={() => {
            setEditingId('new');
            setFormData({ category: '', items: [], order: prices.length });
          }}
          className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300"
          data-testid="add-price-category-btn"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {editingId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal border border-gold-400/50 p-6 mb-6"
        >
          <h3 className="text-gold-400 mb-4">{editingId === 'new' ? 'New Category' : 'Edit Category'}</h3>
          <input
            type="text"
            placeholder="Category Name (e.g., NAILS)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none mb-4"
            data-testid="category-name-input"
          />
          
          <div className="space-y-2 mb-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-obsidian p-2">
                <span className="flex-1 text-neutral-300">{item.name}</span>
                <span className="text-gold-400">{item.price}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="flex-1 bg-obsidian border border-white/10 px-4 py-2 text-white focus:border-gold-400 outline-none"
            />
            <input
              type="text"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="w-32 bg-obsidian border border-white/10 px-4 py-2 text-white focus:border-gold-400 outline-none"
            />
            <button
              onClick={addItem}
              className="bg-white/10 text-white px-4 py-2 hover:bg-white/20"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300">
              <Save size={16} /> Save
            </button>
            <button onClick={() => setEditingId(null)} className="flex items-center gap-2 border border-white/20 text-neutral-400 px-4 py-2 text-sm hover:border-white/40">
              <X size={16} /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {prices.map((category) => (
          <div key={category.id} className="bg-charcoal border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-gold-400 font-medium">{category.category}</h4>
              <div className="flex gap-2">
                <button onClick={() => startEdit(category)} className="p-2 text-neutral-400 hover:text-gold-400">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(category.id)} className="p-2 text-neutral-400 hover:text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {category.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1 border-b border-white/5">
                  <span className="text-neutral-300">{item.name}</span>
                  <span className="text-gold-300">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Testimonials Tab
const TestimonialsTab = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', text: '', rating: 5 });

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/testimonials`);
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await axios.post(`${API}/testimonials`, formData);
      } else {
        await axios.put(`${API}/testimonials/${editingId}`, formData);
      }
      setEditingId(null);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await axios.delete(`${API}/testimonials/${id}`);
        fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  return (
    <div data-testid="testimonials-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-gold-100">Testimonials</h2>
        <button
          onClick={() => {
            setEditingId('new');
            setFormData({ name: '', text: '', rating: 5 });
          }}
          className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300"
          data-testid="add-testimonial-btn"
        >
          <Plus size={16} />
          Add Testimonial
        </button>
      </div>

      {editingId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal border border-gold-400/50 p-6 mb-6"
        >
          <h3 className="text-gold-400 mb-4">{editingId === 'new' ? 'New Testimonial' : 'Edit Testimonial'}</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Client name (e.g., Amaka O.)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none"
              data-testid="testimonial-name-input"
            />
            <textarea
              placeholder="Review text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none min-h-[100px]"
              data-testid="testimonial-text-input"
            />
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-500 mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`p-1 ${star <= formData.rating ? 'text-gold-400' : 'text-neutral-600'}`}
                  >
                    <Star size={24} fill={star <= formData.rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300">
              <Save size={16} /> Save
            </button>
            <button onClick={() => setEditingId(null)} className="flex items-center gap-2 border border-white/20 text-neutral-400 px-4 py-2 text-sm hover:border-white/40">
              <X size={16} /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-charcoal border border-white/10 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-neutral-300 italic mb-2">"{testimonial.text}"</p>
                <p className="text-gold-400 text-sm font-medium">{testimonial.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(testimonial.id);
                    setFormData({ name: testimonial.name, text: testimonial.text, rating: testimonial.rating });
                  }}
                  className="p-2 text-neutral-400 hover:text-gold-400"
                >
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(testimonial.id)} className="p-2 text-neutral-400 hover:text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Promotions Tab
const PromotionsTab = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', discount: '', active: true });

  const fetchPromotions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/promotions`);
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await axios.post(`${API}/promotions`, formData);
      } else {
        await axios.put(`${API}/promotions/${editingId}`, formData);
      }
      setEditingId(null);
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await axios.delete(`${API}/promotions/${id}`);
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  return (
    <div data-testid="promotions-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-gold-100">Promotions</h2>
        <button
          onClick={() => {
            setEditingId('new');
            setFormData({ title: '', description: '', discount: '', active: true });
          }}
          className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300"
          data-testid="add-promotion-btn"
        >
          <Plus size={16} />
          Add Promotion
        </button>
      </div>

      {editingId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal border border-gold-400/50 p-6 mb-6"
        >
          <h3 className="text-gold-400 mb-4">{editingId === 'new' ? 'New Promotion' : 'Edit Promotion'}</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title (e.g., Special Offer)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none"
              data-testid="promotion-title-input"
            />
            <input
              type="text"
              placeholder="Discount (e.g., 15% OFF)"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none"
              data-testid="promotion-discount-input"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none min-h-[100px]"
              data-testid="promotion-description-input"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-5 h-5 accent-gold-400"
              />
              <span className="text-neutral-300">Active (show on website)</span>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300">
              <Save size={16} /> Save
            </button>
            <button onClick={() => setEditingId(null)} className="flex items-center gap-2 border border-white/20 text-neutral-400 px-4 py-2 text-sm hover:border-white/40">
              <X size={16} /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4">
        {promotions.map((promotion) => (
          <div key={promotion.id} className={`bg-charcoal border p-4 ${promotion.active ? 'border-gold-400/50' : 'border-white/10'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-medium">{promotion.title}</h4>
                  {promotion.active && (
                    <span className="text-xs bg-gold-400 text-obsidian px-2 py-0.5 uppercase">Active</span>
                  )}
                </div>
                <p className="text-gold-400 text-lg font-bold mb-1">{promotion.discount}</p>
                <p className="text-neutral-400 text-sm">{promotion.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(promotion.id);
                    setFormData({ title: promotion.title, description: promotion.description, discount: promotion.discount, active: promotion.active });
                  }}
                  className="p-2 text-neutral-400 hover:text-gold-400"
                >
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(promotion.id)} className="p-2 text-neutral-400 hover:text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Gallery Tab
const GalleryTab = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ url: '', caption: '', order: 0 });

  const fetchGallery = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      await axios.post(`${API}/gallery/upload`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchGallery();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await axios.post(`${API}/gallery`, formData);
      } else {
        await axios.put(`${API}/gallery/${editingId}`, formData);
      }
      setEditingId(null);
      fetchGallery();
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await axios.delete(`${API}/gallery/${id}`);
        fetchGallery();
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  return (
    <div data-testid="gallery-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-gold-100">Gallery</h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300 cursor-pointer">
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} data-testid="upload-input" />
          </label>
          <button
            onClick={() => {
              setEditingId('new');
              setFormData({ url: '', caption: '', order: images.length });
            }}
            className="flex items-center gap-2 border border-gold-400 text-gold-400 px-4 py-2 font-bold text-sm hover:bg-gold-400 hover:text-obsidian transition-colors"
            data-testid="add-image-url-btn"
          >
            <Plus size={16} />
            Add URL
          </button>
        </div>
      </div>

      {editingId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal border border-gold-400/50 p-6 mb-6"
        >
          <h3 className="text-gold-400 mb-4">{editingId === 'new' ? 'Add Image URL' : 'Edit Image'}</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Image URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none"
              data-testid="gallery-url-input"
            />
            <input
              type="text"
              placeholder="Caption (optional)"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full bg-obsidian border border-white/10 px-4 py-3 text-white focus:border-gold-400 outline-none"
              data-testid="gallery-caption-input"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 bg-gold-400 text-obsidian px-4 py-2 font-bold text-sm hover:bg-gold-300">
              <Save size={16} /> Save
            </button>
            <button onClick={() => setEditingId(null)} className="flex items-center gap-2 border border-white/20 text-neutral-400 px-4 py-2 text-sm hover:border-white/40">
              <X size={16} /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img src={image.url} alt={image.caption || 'Gallery'} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setEditingId(image.id);
                  setFormData({ url: image.url, caption: image.caption || '', order: image.order || 0 });
                }}
                className="p-2 bg-gold-400 text-obsidian hover:bg-gold-300"
              >
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(image.id)} className="p-2 bg-red-500 text-white hover:bg-red-400">
                <Trash2 size={16} />
              </button>
            </div>
            {image.caption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">{image.caption}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-gold-400">Loading...</div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'services': return <ServicesTab />;
      case 'prices': return <PricesTab />;
      case 'testimonials': return <TestimonialsTab />;
      case 'promotions': return <PromotionsTab />;
      case 'gallery': return <GalleryTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex" data-testid="admin-dashboard">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <main className="flex-1 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10">
          <button onClick={() => setIsMobileOpen(true)} className="text-gold-400">
            <Menu size={24} />
          </button>
          <span className="text-gold-400 font-serif">BeautyBar609</span>
          <a href="/" className="text-neutral-400 hover:text-gold-400">
            <ChevronLeft size={24} />
          </a>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <p className="text-neutral-500 text-sm">Welcome back,</p>
            <p className="text-white font-medium">{user?.name || user?.email}</p>
          </div>
          <a href="/" className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-2">
            <ChevronLeft size={16} />
            View Website
          </a>
        </div>

        <div className="p-4 lg:p-8">
          {renderTab()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
