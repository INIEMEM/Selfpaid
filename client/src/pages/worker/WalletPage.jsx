import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet, Lock, TrendingUp, Trophy } from 'lucide-react';
import WorkerLayout from '../../components/worker/WorkerLayout.jsx';
import { useToast } from '../../components/shared/Toast.jsx';
import {
  getWalletBalance, getTransactionHistory,
  requestWithdrawal, getMyWithdrawals,
} from '../../api/worker.js';

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const withdrawSchema = z.object({
  amount: z.coerce.number().min(6, 'Minimum withdrawal is $6'),
  accountName: z.string().min(2, 'Account name required'),
  accountNumber: z.string().min(4, 'Account number required'),
  bankName: z.string().min(2, 'Bank name required'),
  swiftCode: z.string().optional(),
  routingNumber: z.string().optional(),
});

const TX_TABS = [
  { label: 'All', value: '' },
  { label: 'Deposits', value: 'deposit' },
  { label: 'Withdrawals', value: 'withdrawal' },
  { label: 'Earnings', value: 'task_payment' },
  { label: 'Escrow', value: 'escrow_lock' },
];

const txIcons = { task_payment: '💰', withdrawal: '🏦', deposit: '⬆️', escrow_lock: '🔒', escrow_release: '🔓', escrow_refund: '↩️' };

const statusColors = { completed: '#7ed348', pending: '#f59e0b', failed: '#ef4444', cancelled: '#6b7280' };
const wStatusColors = { pending: '#f59e0b', processing: '#3b82f6', paid: '#7ed348', rejected: '#ef4444', cancelled: '#6b7280' };

const Skeleton = ({ h = 60 }) => (
  <div style={{ height: h, borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
);

const WalletPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [txTab, setTxTab] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [receiveAmt, setReceiveAmt] = useState('');

  const { data: balanceData, isLoading: balLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => (await getWalletBalance()).data,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', txTab, txPage],
    queryFn: async () => (await getTransactionHistory({ type: txTab || undefined, page: txPage, limit: 10 })).data,
  });

  const { data: withdrawData } = useQuery({
    queryKey: ['my-withdrawals'],
    queryFn: async () => (await getMyWithdrawals({ limit: 10 })).data,
  });

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(withdrawSchema),
  });

  const amtVal = watch('amount');
  const afterFee = amtVal > 1 ? (amtVal - 1).toFixed(2) : '—';

  const withdrawMut = useMutation({
    mutationFn: (data) => requestWithdrawal({
      amount: data.amount,
      bankDetails: {
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        swiftCode: data.swiftCode,
        routingNumber: data.routingNumber,
      },
    }),
    onSuccess: () => {
      toast('Withdrawal request submitted!', 'success');
      setWithdrawSuccess(true);
      reset();
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['my-withdrawals'] });
      setTimeout(() => setWithdrawSuccess(false), 4000);
    },
    onError: (err) => toast(err?.response?.data?.message || 'Withdrawal failed', 'error'),
  });

  const inputStyle = {
    width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px', color: '#fff', fontFamily: "'Outfit',sans-serif",
    fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 };

  const transactions = txData?.transactions || [];
  const totalTx = txData?.total || 0;
  const withdrawals = withdrawData?.withdrawals || [];

  const walBalance = balanceData?.walletBalance || 0;
  const escBalance = balanceData?.escrowBalance || 0;
  const totalEarned = balanceData?.totalEarned || walBalance + escBalance;

  return (
    <WorkerLayout pageTitle="Wallet">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: Wallet, label: 'Available Balance', value: fmt(walBalance), color: '#7ed348' },
          { icon: Lock, label: 'In Escrow', value: fmt(escBalance), color: '#c9a84c' },
          { icon: TrendingUp, label: 'Total Earned', value: fmt(totalEarned), color: '#fff' },
          { icon: Trophy, label: 'SPX Tokens', value: String(balanceData?.tokenBalance || 0), color: '#c9a84c', sub: 'Future utility tokens' },
        ].map(({ icon: Icon, label, value, color, sub }) => (
          <div key={label} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon size={18} style={{ color }} />
            </div>
            {balLoading ? <div style={{ height: 30, width: '60%', borderRadius: 6, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} /> : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color, lineHeight: 1 }}>{value}</div>
                {label === 'SPX Tokens' && <span style={{ fontSize: 13, color: color, fontWeight: 700 }}>SPX</span>}
              </div>
            )}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{label}</div>
            {sub && <div style={{ fontSize: 11, color: color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 24, marginBottom: 28, alignItems: 'start' }}>
        {/* Withdraw Form */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 6px' }}>Withdraw Funds</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 20px' }}>$1 processing fee applies · Minimum withdrawal: $6</p>

          {withdrawSuccess && (
            <div style={{ background: 'rgba(126,211,72,0.1)', border: '1px solid rgba(126,211,72,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#7ed348' }}>
              ✓ Withdrawal request submitted successfully!
            </div>
          )}

          <form onSubmit={handleSubmit((d) => withdrawMut.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>AMOUNT ($)</label>
              <input {...register('amount')} type="number" step="0.01" placeholder="0.00" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {amtVal > 1 && <p style={{ fontSize: 12, color: '#7ed348', marginTop: 4 }}>You&apos;ll receive: ${afterFee}</p>}
              {errors.amount && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.amount.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>ACCOUNT NAME</label>
              <input {...register('accountName')} type="text" placeholder="Full name on account" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {errors.accountName && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.accountName.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>ACCOUNT NUMBER</label>
              <input {...register('accountNumber')} type="text" placeholder="Account number" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {errors.accountNumber && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.accountNumber.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>BANK NAME</label>
              <input {...register('bankName')} type="text" placeholder="Bank name" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {errors.bankName && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.bankName.message}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>SWIFT CODE (Optional)</label>
                <input {...register('swiftCode')} type="text" placeholder="e.g. CITIUS33" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label style={labelStyle}>ROUTING NO. (Optional)</label>
                <input {...register('routingNumber')} type="text" placeholder="e.g. 021000021" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={withdrawMut.isPending}
              style={{ padding: '14px', borderRadius: 10, border: 'none', background: withdrawMut.isPending ? 'rgba(126,211,72,0.4)' : 'linear-gradient(135deg,#7ed348,#4caf50)', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, cursor: withdrawMut.isPending ? 'not-allowed' : 'pointer', marginTop: 4 }}
            >
              {withdrawMut.isPending ? 'Submitting...' : 'Request Withdrawal'}
            </button>
          </form>
        </div>

        {/* Withdrawal Requests */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 16px' }}>Withdrawal Requests</h3>
          {withdrawals.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No withdrawal requests yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {withdrawals.map((w) => (
                <div key={w._id} style={{ background: '#1a1a1a', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {fmt(w.requestedAmount)} → <span style={{ color: '#7ed348' }}>{fmt(w.amountAfterFee)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {w.bankDetails?.bankName} · {fmtDate(w.createdAt)}
                    </div>
                  </div>
                  <span style={{ background: `${wStatusColors[w.status] || '#888'}18`, color: wStatusColors[w.status] || '#888', border: `1px solid ${wStatusColors[w.status] || '#888'}30`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 16px' }}>Transaction History</h3>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1a1a1a', borderRadius: 10, padding: 4, overflowX: 'auto' }}>
          {TX_TABS.map(({ label, value }) => (
            <button key={value} onClick={() => { setTxTab(value); setTxPage(1); }}
              style={{ padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: txTab === value ? 'rgba(126,211,72,0.12)' : 'transparent', color: txTab === value ? '#7ed348' : 'rgba(255,255,255,0.45)', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 12, transition: 'all 0.15s' }}
            >
              {label}
            </button>
          ))}
        </div>

        {txLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(5)].map((_, i) => <Skeleton key={i} h={56} />)}
          </div>
        ) : transactions.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>No transactions yet.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {transactions.map((tx) => {
                const isCredit = ['task_payment','deposit','escrow_release','escrow_refund'].includes(tx.type);
                return (
                  <div key={tx._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center' }}>{txIcons[tx.type] || '💳'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || tx.type.replace(/_/g,' ')}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{fmtDate(tx.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: isCredit ? '#7ed348' : '#ef4444' }}>
                        {isCredit ? '+' : '-'}{fmt(tx.amount)}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: statusColors[tx.status] || '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {transactions.length < totalTx && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button onClick={() => setTxPage((p) => p + 1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 28px', color: '#fff', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </WorkerLayout>
  );
};

export default WalletPage;
