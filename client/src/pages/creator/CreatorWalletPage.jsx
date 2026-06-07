import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Lock, TrendingUp, ArrowUpCircle } from 'lucide-react';
import CreatorLayout from '../../components/creator/CreatorLayout.jsx';
import { useToast } from '../../components/shared/Toast.jsx';
import { getCreatorWalletBalance, getCreatorTransactions, createDepositIntent } from '../../api/creator.js';

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const TX_TABS = [
  { label: 'All', value: '' },
  { label: 'Deposits', value: 'deposit' },
  { label: 'Task Spending', value: 'escrow_lock' },
  { label: 'Refunds', value: 'escrow_refund' },
];

const txIcons = { task_payment: '💰', withdrawal: '🏦', deposit: '⬆️', escrow_lock: '🔒', escrow_release: '🔓', escrow_refund: '↩️' };
const statusColors = { completed: '#7ed348', pending: '#f59e0b', failed: '#ef4444', cancelled: '#6b7280' };

const Skeleton = ({ h = 56 }) => (
  <div style={{ height: h, borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
);

const CreatorWalletPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [txTab, setTxTab] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [depositAmount, setDepositAmount] = useState('');

  const { data: balanceData, isLoading: balLoading } = useQuery({
    queryKey: ['creator-wallet-balance'],
    queryFn: async () => (await getCreatorWalletBalance()).data,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['creator-transactions', txTab, txPage],
    queryFn: async () => (await getCreatorTransactions({ type: txTab || undefined, page: txPage, limit: 10 })).data,
  });

  const depositMut = useMutation({
    mutationFn: () => createDepositIntent({ amount: Number(depositAmount) }),
    onSuccess: (res) => {
      const url = res.data?.authorizationUrl || res.data?.data?.authorization_url;
      if (url) {
        window.open(url, '_blank');
        toast('Redirecting to Paystack payment gateway...', 'success');
      } else {
        toast('Deposit initiated. Check your email for payment link.', 'success');
      }
      queryClient.invalidateQueries({ queryKey: ['creator-wallet-balance'] });
      setDepositAmount('');
    },
    onError: (err) => toast(err?.response?.data?.message || 'Deposit failed', 'error'),
  });

  const wallet = balanceData?.wallet || {};
  const transactions = txData?.transactions || [];
  const totalTx = txData?.total || 0;

  const inputStyle = {
    width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px', color: '#fff', fontFamily: "'Outfit',sans-serif",
    fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <CreatorLayout pageTitle="Wallet">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: Wallet, label: 'Available Balance', value: fmt(wallet.available), color: '#c9a84c' },
          { icon: Lock, label: 'In Escrow (Active Tasks)', value: fmt(wallet.inEscrow), color: '#f59e0b' },
          { icon: TrendingUp, label: 'Total Deposited', value: fmt(wallet.total), color: '#fff' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px 20px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon size={18} style={{ color }} />
            </div>
            {balLoading ? <Skeleton h={30} /> : (
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color, lineHeight: 1 }}>{value}</div>
            )}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 24, marginBottom: 28, alignItems: 'start' }}>
        {/* Deposit Form */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 6px' }}>Deposit Funds</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>
            Top up your wallet via Paystack to fund task rewards. Funds are held securely until task completion.
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>DEPOSIT AMOUNT (USD)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#c9a84c', fontWeight: 700, fontSize: 16 }}>$</span>
              <input
                type="number" min="5" step="1" placeholder="0.00"
                value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 30 }}
                onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            {depositAmount >= 5 && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Minimum deposit is $5</p>}
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 18 }}>
            {[10, 25, 50, 100].map((amt) => (
              <button
                key={amt} onClick={() => setDepositAmount(String(amt))}
                style={{ padding: '8px', borderRadius: 8, border: `1px solid ${depositAmount == amt ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.1)'}`, background: depositAmount == amt ? 'rgba(201,168,76,0.1)' : '#1a1a1a', color: depositAmount == amt ? '#c9a84c' : 'rgba(255,255,255,0.55)', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                ${amt}
              </button>
            ))}
          </div>

          <button
            onClick={() => depositAmount >= 5 && depositMut.mutate()}
            disabled={!depositAmount || depositAmount < 5 || depositMut.isPending}
            style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: (!depositAmount || depositAmount < 5 || depositMut.isPending) ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg,#c9a84c,#eab308)', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, cursor: (!depositAmount || depositAmount < 5 || depositMut.isPending) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <ArrowUpCircle size={18} />
            {depositMut.isPending ? 'Processing...' : 'Deposit via Paystack'}
          </button>
        </div>

        {/* Escrow Info */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 16px' }}>How It Works</h3>
          {[
            { icon: '💳', title: 'Deposit Funds', desc: 'Add funds to your wallet via Paystack (debit/credit card or bank transfer).' },
            { icon: '🔒', title: 'Post a Task', desc: 'When you create a task, the reward is locked in escrow — workers know they\'ll get paid.' },
            { icon: '✅', title: 'Approve Work', desc: 'Review submitted work. Approve to release payment, or reject to request revisions.' },
            { icon: '↩️', title: 'Cancel Anytime', desc: 'Cancel an open task before it\'s assigned and get your escrowed funds returned.' },
          ].map((item) => (
            <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 16px' }}>Transaction History</h3>
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1a1a1a', borderRadius: 10, padding: 4, overflowX: 'auto' }}>
          {TX_TABS.map(({ label, value }) => (
            <button key={value} onClick={() => { setTxTab(value); setTxPage(1); }}
              style={{ padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: txTab === value ? 'rgba(201,168,76,0.12)' : 'transparent', color: txTab === value ? '#c9a84c' : 'rgba(255,255,255,0.45)', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 12, transition: 'all 0.15s' }}
            >
              {label}
            </button>
          ))}
        </div>
        {txLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[...Array(5)].map((_, i) => <Skeleton key={i} />)}</div>
        ) : transactions.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>No transactions yet.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {transactions.map((tx) => {
                const isCredit = ['deposit', 'escrow_refund'].includes(tx.type);
                return (
                  <div key={tx._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: 'center' }}>{txIcons[tx.type] || '💳'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || tx.type.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{fmtDate(tx.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: isCredit ? '#7ed348' : '#ef4444' }}>
                        {isCredit ? '+' : '-'}{fmt(tx.amount)}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: statusColors[tx.status] || '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tx.status}</span>
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
    </CreatorLayout>
  );
};

export default CreatorWalletPage;
