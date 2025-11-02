
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Expense, ExpenseCategory } from '../types';

// #region Modals
const ExpenseFormModal: React.FC<{
    expense: Expense | null;
    categories: ExpenseCategory[];
    onClose: () => void;
    onSave: (data: Expense | Omit<Expense, 'id'|'date'>) => void;
}> = ({ expense, categories, onClose, onSave }) => {
    const isEditing = !!expense;
    const [formData, setFormData] = useState({
        categoryId: expense?.categoryId || categories[0]?.id || '',
        amount: expense?.amount || 0,
        description: expense?.description || ''
    });
    const [errors, setErrors] = useState({ amount: '', description: '' });

    const validate = () => {
        const newErrors = { amount: '', description: '' };
        let isValid = true;
        if (formData.amount <= 0) {
            newErrors.amount = 'Amount must be a positive number.';
            isValid = false;
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(isEditing ? { ...expense, ...formData } : formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) : value
        }));
    };

    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
    const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700"><h2 className="text-xl font-bold">{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2></div>
                    <div className="p-6 space-y-4">
                         <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium">Category</label>
                            <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className={baseInputClasses}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium">Amount*</label>
                            <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} step="0.01" min="0" className={`${baseInputClasses} ${errors.amount ? errorInputClasses : ''}`} />
                            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium">Description*</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={`${baseInputClasses} ${errors.description ? errorInputClasses : ''}`} />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Expense'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// #endregion

const ExpensesPage: React.FC = () => {
    const { expenses, expenseCategories, hasPermission, addExpense, updateExpense, deleteExpense } = useAuth();
    const canManage = hasPermission('expense:manage');
    const canView = hasPermission('expense:view');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const categoriesMap = useMemo(() => new Map(expenseCategories.map(c => [c.id, c.name])), [expenseCategories]);

    const filteredExpenses = useMemo(() => {
        return expenses
            .filter(exp => categoryFilter === 'all' || exp.categoryId === categoryFilter)
            .filter(exp => !dateRange.start || new Date(exp.date) >= new Date(dateRange.start))
            .filter(exp => {
                if (!dateRange.end) return true;
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                return new Date(exp.date) <= endDate;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, categoryFilter, dateRange]);

    const handleOpenModal = (expense: Expense | null) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleSaveExpense = (data: Expense | Omit<Expense, 'id' | 'date'>) => {
        if ('id' in data) {
            updateExpense(data);
        } else {
            addExpense(data);
        }
        setIsModalOpen(false);
    };
    
    const handleDeleteExpense = (expense: Expense) => {
        if(window.confirm(`Are you sure you want to delete this expense?`)) {
            deleteExpense(expense.id);
        }
    };

    if (!canView) {
        return <div className="text-center p-8">Access Denied. You don't have permission to view expenses.</div>;
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Expenses</h1>
                            <p className="text-slate-500 mt-1">Track your business expenditures.</p>
                        </div>
                        <button onClick={() => handleOpenModal(null)} disabled={!canManage} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            Add Expense
                        </button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select onChange={e => setCategoryFilter(e.target.value)} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500">
                            <option value="all">All Categories</option>
                            {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="date" name="start" onChange={e => setDateRange(p => ({...p, start: e.target.value}))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500" />
                        <input type="date" name="end" onChange={e => setDateRange(p => ({...p, end: e.target.value}))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map(exp => (
                                <tr key={exp.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="px-6 py-4">{new Date(exp.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{categoriesMap.get(exp.categoryId)}</td>
                                    <td className="px-6 py-4">{exp.description}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{exp.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleOpenModal(exp)} disabled={!canManage} className="font-medium text-indigo-600 hover:underline disabled:text-slate-400">Edit</button>
                                        <button onClick={() => handleDeleteExpense(exp)} disabled={!canManage} className="font-medium text-red-600 hover:underline disabled:text-slate-400">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <ExpenseFormModal expense={editingExpense} categories={expenseCategories} onClose={() => setIsModalOpen(false)} onSave={handleSaveExpense} />}
        </>
    );
};

export default ExpensesPage;
