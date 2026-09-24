import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import { Tags, Plus, Edit2, Trash2, ShieldAlert, Package } from 'lucide-react';

const WasteCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    recommendedContainer: '',
    colorCode: '#0D9488',
    hazardLevel: 'Medium',
    status: 'active',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res?.data) {
        setCategories(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        code: cat.code,
        description: cat.description,
        recommendedContainer: cat.recommendedContainer,
        colorCode: cat.colorCode || '#0D9488',
        hazardLevel: cat.hazardLevel || 'Medium',
        status: cat.status || 'active',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        recommendedContainer: '',
        colorCode: '#0D9488',
        hazardLevel: 'Medium',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        addToast('Waste category updated.', 'success');
      } else {
        await api.post('/categories', formData);
        addToast('New waste category added.', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      addToast(err.message || 'Operation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      await api.delete(`/categories/${deleteTarget._id}`);
      addToast('Category deleted.', 'success');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      addToast(err.message || 'Failed to delete category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Biomedical Waste Categories</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic segregation classification, color coding standards & container requirements
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading waste classification categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No waste categories registered"
          description="Create standard categories such as Infectious, Sharps, Pathological waste."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <GlassCard key={cat._id} className="relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                      style={{ backgroundColor: cat.colorCode }}
                    />
                    <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-teal-400">
                      {cat.code}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      cat.hazardLevel === 'Biohazardous'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : cat.hazardLevel === 'High'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                    }`}
                  >
                    {cat.hazardLevel} Hazard
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{cat.name}</h3>
                <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/40 text-xs mb-3">
                  <div className="flex items-center space-x-1.5 text-teal-400 font-semibold mb-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>Recommended Container</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{cat.recommendedContainer}</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenModal(cat)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Waste Category' : 'Create New Waste Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Infectious Waste"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Category Code (e.g. INF, SHP) *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="INF"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Description & Protocol *
            </label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Clinical waste contaminated with blood, swabs, culture tubes..."
              className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Recommended Container / Color-Coded Bag *
            </label>
            <input
              type="text"
              required
              value={formData.recommendedContainer}
              onChange={(e) => setFormData({ ...formData, recommendedContainer: e.target.value })}
              placeholder="Yellow Double-Layer Biohazard Bag"
              className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Color Tag (Hex)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  className="flex-1 px-3 py-2 text-xs rounded-xl glass-input font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Hazard Severity Level
              </label>
              <select
                value={formData.hazardLevel}
                onChange={(e) => setFormData({ ...formData, hazardLevel: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                <option value="Low">Low Hazard</option>
                <option value="Medium">Medium Hazard</option>
                <option value="High">High Hazard</option>
                <option value="Biohazardous">Biohazardous</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Waste Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Waste records currently mapped to this category may require re-classification.`}
        confirmText="Delete Category"
        isDanger={true}
        loading={submitting}
      />
    </div>
  );
};

export default WasteCategoriesPage;
