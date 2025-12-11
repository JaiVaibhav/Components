import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

type User = {
  id: number;
  name: string;
  email: string;
  company?: { name: string };
};

type Team = {
  id: number;
  name: string;
  members: number;
  owner: string;
};

type AsyncState<T> = {
  data: T[];
  loading: boolean;
  error: string | null;
};

const PAGE_SIZE = 5;
type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export const AdminDashboard: React.FC = () => {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Admin Dashboard</h1>
      <p style={{ marginBottom: 24 }}>
        Users and Teams management. (This file is intentionally a bit messy so
        you can refactor it with custom hooks.)
      </p>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <UsersPanel />
        <TeamsPanel />
      </div>
    </div>
  );
};

function useDebouncedSearch(
  search: string,
  delay: number = 400
) {
  const [debouncedValue, setDebouncedValue] = useState("");
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedValue(search)
    }, delay);

    return () => clearTimeout(handle);
  }, [search, delay]);

  return debouncedValue;
}

function useFetchData(url:any, state:any, refreshIndex:any){
  const [data, setData] = useState(state);

   useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      // setData((prev)=>{...prev, loading:true, error:null });
      setData((prev:any)=>({...prev, loading:true, error:null }))
      try {
        // Fake API
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const json: User[] = await res.json();

        if (!cancelled) {
          setData({
            data: json,
            loading: false,
            error: null,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          return{
            data: [],
            loading: false,
            error:
              err instanceof Error ? err.message : "Unknown error occurred",
          };
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  },[refreshIndex, url]);
  return data;
}

const UsersPanel: React.FC = () => {
  const [state, setState] = useState<AsyncState<User>>({
    data: [],
    loading: false,
    error: null,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshIndex, setRefreshIndex] = useState(0);


  // --- debounced search (duplicated in TeamsPanel) ---
  


const debouncedValue = useDebouncedSearch(search)
const userData = useFetchData("https://jsonplaceholder.typicode.com/users", state, refreshIndex);

useEffect(()=>{
setState(userData);
},[userData])
    useEffect(()=>{
      setDebouncedSearch(debouncedValue);
      setPage(1);
    }, [debouncedValue])

  // --- data fetching (duplicated in TeamsPanel, but with a different URL/shape) ---
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        // Fake API
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const json: User[] = await res.json();

        if (!cancelled) {
          setState({
            data: json,
            loading: false,
            error: null,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setState({
            data: [],
            loading: false,
            error:
              err instanceof Error ? err.message : "Unknown error occurred",
          });
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [refreshIndex]);

  const handleSearchChange = useCallback(
    (e: ChangeEvent) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleRefresh = useCallback(() => {
    setRefreshIndex((i) => i + 1);
  }, []);

  const filtered = useMemo(() => {
    const lower = debouncedSearch.toLowerCase();
    if (!lower) return state.data;
    return state.data.filter((u) => {
      return (
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.company?.name?.toLowerCase().includes(lower)
      );
    });
  }, [state.data, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage((prev) => {
        if (nextPage < 1) return prev;
        if (nextPage > totalPages) return prev;
        return nextPage;
      });
    },
    [totalPages]
  );

  return (
    <section
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 16,
        width: 420,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Users</h2>
        <button onClick={handleRefresh} disabled={state.loading}>
          {state.loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search users by name, email, company"
          value={search}
          onChange={handleSearchChange}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
      </div>

      {state.error && (
        <div style={{ color: "red", marginBottom: 8 }}>Error: {state.error}</div>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, minHeight: 120 }}>
        {state.loading && state.data.length === 0 ? (
          <li>Loading users...</li>
        ) : paginated.length === 0 ? (
          <li>No users found.</li>
        ) : (
          paginated.map((user) => (
            <li
              key={user.id}
              style={{
                padding: "6px 4px",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{user.email}</div>
              {user.company?.name && (
                <div style={{ fontSize: 12, color: "#777" }}>
                  Company: {user.company.name}
                </div>
              )}
            </li>
          ))
        )}
      </ul>

      <Pagination
        page={pageSafe}
        totalPages={totalPages}
        onChange={goToPage}
      />
    </section>
  );
};

const TeamsPanel: React.FC = () => {
  const [state, setState] = useState<AsyncState<Team>>({
    data: [],
    loading: false,
    error: null,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // --- debounced search (same pattern as UsersPanel) ---  
  const debouncedValue = useDebouncedSearch(search)

  useEffect(()=>{
      setDebouncedSearch(debouncedValue);
      setPage(1);
  },[debouncedValue])

  const teamsData = useFetchData("https://jsonplaceholder.typicode.com/users", state, refreshIndex);

  useEffect(()=>{
    setState(teamsData);
  },[teamsData])

  // useEffect(() => {
  //   const handle = setTimeout(() => {
  //     setDebouncedSearch(search.trim());
  //     setPage(1);
  //   }, 400);

  //   return () => clearTimeout(handle);
  // }, [search]);

  // --- data fetching (same lifecycle/shape, but different resource) ---
  // useEffect(() => {
  //   let cancelled = false;

  //   async function loadTeams() {
  //     setState((prev) => ({ ...prev, loading: true, error: null }));
  //     try {
  //       // Simulated API – pretend this returns teams data
  //       const res = await fetch("https://jsonplaceholder.typicode.com/users"); // imagine this exists
  //       if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  //       const json: Team[] = await res.json();

  //       if (!cancelled) {
  //         setState({
  //           data: json,
  //           loading: false,
  //           error: null,
  //         });
  //       }
  //     } catch (err: unknown) {
  //       if (!cancelled) {
  //         setState({
  //           data: [],
  //           loading: false,
  //           error:
  //             err instanceof Error ? err.message : "Unknown error occurred",
  //         });
  //       }
  //     }
  //   }

  //   loadTeams();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [refreshIndex]);

  const handleSearchChange = useCallback(
    (e: ChangeEvent) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleRefresh = useCallback(() => {
    setRefreshIndex((i) => i + 1);
  }, []);

  const filtered = useMemo(() => {
    const lower = debouncedSearch.toLowerCase();
    if (!lower) return state.data;
    return state.data.filter((t) => {
      return (
        t.name.toLowerCase().includes(lower) ||
        (t.owner || "").toLowerCase().includes(lower)
      );
    });
  }, [state.data, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage((prev) => {
        if (nextPage < 1) return prev;
        if (nextPage > totalPages) return prev;
        return nextPage;
      });
    },
    [totalPages]
  );

  return (
    <section
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 16,
        width: 420,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Teams</h2>
        <button onClick={handleRefresh} disabled={state.loading}>
          {state.loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search teams by name or owner"
          value={search}
          onChange={handleSearchChange}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
      </div>

      {state.error && (
        <div style={{ color: "red", marginBottom: 8 }}>Error: {state.error}</div>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, minHeight: 120 }}>
        {state.loading && state.data.length === 0 ? (
          <li>Loading teams...</li>
        ) : paginated.length === 0 ? (
          <li>No teams found.</li>
        ) : (
          paginated.map((team) => (
            <li
              key={team.id}
              style={{
                padding: "6px 4px",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ fontWeight: 600 }}>{team.name}</div>
              <div style={{ fontSize: 12, color: "#555" }}>
                Owner: {team.owner}
              </div>
              <div style={{ fontSize: 12, color: "#777" }}>
                Members: {team.members}
              </div>
            </li>
          ))
        )}
      </ul>

      <Pagination
        page={pageSafe}
        totalPages={totalPages}
        onChange={goToPage}
      />
    </section>
  );
};

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onChange,
}) => {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      style={{
        marginTop: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 12,
      }}
    >
      <div>
        Page {page} of {totalPages}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onChange(page - 1)} disabled={!canPrev}>
          Previous
        </button>
        <button onClick={() => onChange(page + 1)} disabled={!canNext}>
          Next
        </button>
      </div>
    </div>
  );
};
