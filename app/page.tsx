"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "https://users-api-latest.onrender.com";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  country: string;
  created_at: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  age: string;
  country: string;
}

const COUNTRIES = ["México", "Colombia", "Argentina", "Chile", "España", "República Dominicana"];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [form, setForm] = useState<FormData>({
    first_name: "", last_name: "", email: "", age: "", country: "México",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Error conectando al API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchUsers();
  }, [status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: parseInt(form.age) }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Error al crear usuario");
        return;
      }
      setShowForm(false);
      setForm({ first_name: "", last_name: "", email: "", age: "", country: "México" });
      fetchUsers();
    } catch {
      setError("Error de red");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar usuario?")) return;
    await fetch(`${API}/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const handleSeed = async () => {
    setSeeding(true);
    await fetch(`${API}/users/seed?count=10`, { method: "POST" });
    await fetchUsers();
    setSeeding(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 mt-1">{users.length} usuarios registrados</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cerrar sesión
            </button>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition disabled:opacity-50"
            >
              {seeding ? "Generando..." : "🎲 Generar 10 random"}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition"
            >
              + Nuevo usuario
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Nuevo usuario</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Nombre" required value={form.first_name}
                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    placeholder="Apellido" required value={form.last_name}
                    onChange={e => setForm({ ...form, last_name: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <input
                  type="email" placeholder="Email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number" placeholder="Edad" required min={1} max={120} value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <select
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setError(""); }}
                    className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-1 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition">
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">No hay usuarios aún</p>
              <button onClick={handleSeed}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
                Generar usuarios de prueba
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Nombre", "Email", "Edad", "País", "Creado", ""].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/users/${u.id}`)}
                        className="font-medium text-gray-900 hover:underline text-left"
                      >
                        {u.first_name} {u.last_name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{u.age}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{u.country}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(u.id)}
                        className="text-red-400 hover:text-red-600 text-sm transition">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
