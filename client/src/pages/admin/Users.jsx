import { useState } from 'react';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Spinner, EmptyState, ErrorState, PageTitle, Alert, Pagination, formatDate } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error, refetch } = useFetch('/admin/users', { role: role || undefined, page, limit: 20 }, [role, page]);
  const [err, setErr] = useState('');
  const [targetUser, setTargetUser] = useState(null);

  const confirmToggle = async () => {
    if (!targetUser) return;
    try {
      await api.patch(`/admin/users/${targetUser._id}/status`, { isActive: !targetUser.isActive });
      refetch();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setTargetUser(null);
    }
  };

  return (
    <div className="py-6">
      <PageTitle
        title="Users"
        subtitle={pagination ? `${pagination.total} accounts` : ''}
        action={
          <select
            className="input-orchid w-auto"
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
          >
            <option value="" className="bg-[#12102b] text-white">All roles</option>
            <option value="student" className="bg-[#12102b] text-white">Students</option>
            <option value="recruiter" className="bg-[#12102b] text-white">Recruiters</option>
            <option value="admin" className="bg-[#12102b] text-white">Admins</option>
          </select>
        }
      />

      {err && <div className="mb-6"><Alert type="error">{err}</Alert></div>}

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState title="No users found" />
      ) : (
        <>
          <div className="card-orchid hidden overflow-x-auto p-0 md:block">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-[#c9c6e0]/70 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors duration-150">
                    <td className="px-5 py-4 font-medium text-white">{u.name}</td>
                    <td className="px-5 py-4 text-[#c9c6e0]">{u.email}</td>
                    <td className="px-5 py-4 capitalize text-[#c9c6e0]">{u.role}</td>
                    <td className="px-5 py-4 text-[#c9c6e0]">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge-pill text-xs ${
                          u.isActive
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {u._id !== me._id && (
                        <button
                          onClick={() => setTargetUser(u)}
                          className={`btn-pill-ghost btn-pill-sm ${
                            u.isActive ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                          }`}
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {data.map((u) => (
              <div key={u._id} className="card-orchid flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">
                    {u.name} <span className="text-xs text-[#c9c6e0]/70 capitalize">· {u.role}</span>
                  </p>
                  <p className="text-xs text-[#c9c6e0] truncate mt-0.5">{u.email}</p>
                </div>
                {u._id !== me._id && (
                  <button
                    onClick={() => setTargetUser(u)}
                    className={`btn-pill-ghost btn-pill-sm ${
                      u.isActive ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    {u.isActive ? 'Disable' : 'Enable'}
                  </button>
                )}
              </div>
            ))}
          </div>

          <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
        </>
      )}

      {/* ConfirmDialog for disabling / enabling users */}
      <ConfirmDialog
        isOpen={Boolean(targetUser)}
        title={`${targetUser?.isActive ? 'Disable' : 'Enable'} User?`}
        message={`Are you sure you want to ${targetUser?.isActive ? 'disable' : 'enable'} account access for "${targetUser?.name}" (${targetUser?.email})?`}
        confirmText={targetUser?.isActive ? 'Yes, disable' : 'Yes, enable'}
        cancelText="No"
        isDangerous={targetUser?.isActive}
        onConfirm={confirmToggle}
        onClose={() => setTargetUser(null)}
      />
    </div>
  );
}
