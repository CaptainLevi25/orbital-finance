import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import { ArrowLeft, Check, RefreshCw, Trash2, Wallet, X } from "lucide-react";
import { Button } from "../components/ui/Button";

export const WalletSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, setWalletCategoryLimit } = useFinance();
  const wallet = state.wallets.find((w) => w.id === id);
  console.log(state)
  const categories = new Map(
    Array.from(state.categories).filter(([cat, walletinfo]) =>
      walletinfo.has(String(id)),
    ),
  );
  const today = new Date().toISOString().split("T")[0];

  const [categorySettings, setCategorySettings] = useState(() => {
    const settings = new Map<string, { amount: number; date: string }>();

    categories.forEach((walletMap, category) => {
      const existing = walletMap.get(id!);

      settings.set(category, {
        amount: existing?.amount ?? 0,
        date: existing?.date ?? today,
      });
    });

    return settings;
  });
  const [saveStatus, setSaveStatus] = useState(false);

  // --- toast additions start ---
  // snapshot of settings as they were when the page loaded, used to diff on save
  const [initialSettings] = useState(() => new Map(categorySettings));
  const [toast, setToast] = useState<{ categories: string[] } | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);
  // --- toast additions end ---

  const handleSave = () => {
    if (!wallet) return;
    setWalletCategoryLimit(wallet.id, categorySettings);

    // --- toast additions start ---
    const changedCategories: string[] = [];
    categorySettings.forEach((value, category) => {
      const original = initialSettings.get(category);
      if (
        !original ||
        original.amount !== value.amount ||
        original.date !== value.date
      ) {
        changedCategories.push(category);
      }
    });

    setToast({ categories: changedCategories });
    // --- toast additions end ---
  };

  if (!wallet) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen">
        <div className="text-center text-text-secondary">
          <p className="text-xl font-semibold mb-4">Wallet not found</p>
          <Button onClick={() => navigate("/setting")} variant="primary">
            Back to Wallets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-mono text-text-secondary hover:text-text-primary transition-colors mb-2 group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform duration-150"
            />
            <span className="text-sm font-medium">Back to Settings</span>
          </button>
          <div className="text-lg md:text-3xl font-sans font-medium tracking-tight text-text-primary flex items-center gap-2">
            <Wallet size={24} />  {wallet.name} Settings 
          </div>
          <p className="text-text-secondary mt-2 font-mono text-sm">
            Set a max limit and start date for each category on this wallet.
          </p>
        </div>
        <div className=" border border-border bg-bg-surface p-4">
          <div className="text-xs font-mono text-text-tertiary uppercase tracking-wide mb-2">
            Wallet
          </div>
          <div
            className="text-lg font-semibold"
            style={{ color: wallet.color }}
          >
            {wallet.name}
          </div>
          <div className="text-xs font-mono text-text-secondary">
            {wallet.baseCurrency} · {wallet.type}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-bg-surface border border-border p-6 ">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
        
                <div className="text-sm text-text-secondary">
                  Tip: Press Clear to remove the Limit for the category.
                      Make Sure to save your changes before leaving the page.
                </div>
             
            </div>

            <div className="grid gap-4">
              {Array.from(categories).length === 0 ? (
                <div className=" border border-border p-6 text-text-secondary">
                  No categories available yet.
                </div>
              ) : (
                Array.from(categories).map(([category, walletInfo]) => {
                  return (
                    <div
                      key={category}
                      className="grid gap-3  border border-border p-4 md:grid-cols-[1.5fr_1fr_1fr_auto]"
                    >
                      <div>
                        <div className="font-sans text-2xl font-semibold text-text-primary">
                          {category} <span className="text-sm"> </span>
                        </div>
                        <div className="text-xs font-mono text-text-tertiary">
                          Limit settings for this wallet
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-text-tertiary uppercase tracking-wide mb-2">
                          Max Limit
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder={"No Limit"}
                          value={categorySettings.get(category)?.amount === 0 ? "": categorySettings.get(category)?.amount}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) => {
                            const value = e.target.value;
                            console.log(value)
                            setCategorySettings((prev) => {
                              const copy = new Map(prev);

                              copy.set(category, {
                                ...copy.get(category)!,
                                amount: Number(value),
                              });

                              return copy;
                            });

                          }}
                          className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-text-tertiary uppercase tracking-wide mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={categorySettings.get(category)?.date ?? today}
                          onChange={(e) => {
                            setCategorySettings((prev) => {
                              const copy = new Map(prev);

                              copy.set(category, {
                                ...copy.get(category)!,
                                date: e.target.value,
                              });

                              return copy;
                            });

                          }}
                          className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCategorySettings((prev) => {
                            const copy = new Map(prev);

                            copy.set(category, {
                              amount: 0,
                              date: today,
                            });

                            return copy;
                          });
                        }}
                        className="self-end text-sm font-mono text-negative hover:text-negative/80 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex gap-3 ">
            <Button
              onClick={() => navigate(`/wallet/${wallet.id}`)}
              variant="secondary"
            >
              Back to Wallet
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              icon={<Check size={16} />}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      {/*toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-bg-primary border border-border shadow-lg px-5 py-3 text-sm font-mono text-text-primary flex items-center gap-3 z-50"
          role="status"
        >
          <Check size={16} className="text-positive shrink-0" />
          <span>
            {toast.categories.length > 0
              ? `Saved setting for ${toast.categories.join(", ")}`
              : "No changes to save"}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
};