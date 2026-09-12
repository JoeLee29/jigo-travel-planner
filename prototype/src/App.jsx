import { useEffect, useMemo, useRef, useState } from "react";
import GoogleMapView, { GoogleMapEmbed } from "./GoogleMapView.jsx";
import {
  aiReplies,
  friends as friendIds,
  initialAlbums,
  initialBudgets,
  initialExpenses,
  initialMessages,
  initialPins,
  initialPlan,
  initialPosts,
  initialTrips,
  me,
  people,
  pinTypes,
  searchHints,
  detailsFor,
} from "./data.js";

const frames = [
  { id: "login", label: "01 Login" },
  { id: "feed", label: "02 Feed / Posts" },
  { id: "map", label: "03 Map + pins" },
  { id: "trip", label: "04 Trip plan" },
  { id: "budget", label: "05 Budget + split" },
  { id: "chat", label: "06 Trip chat" },
  { id: "profile", label: "07 Profile" },
  { id: "compose", label: "08 Create menu" },
];

function Logo({ size = 36 }) {
  return (
    <svg className="logo-wrap" width={size} height={size} viewBox="0 0 64 64" aria-label="JIGo">
      <circle cx="32" cy="34" r="20" fill="#FFE28A" stroke="#1D2A4A" strokeWidth="2.4" />
      <ellipse cx="24" cy="31" rx="2.2" ry="2.6" fill="#1D2A4A" />
      <ellipse cx="34" cy="31" rx="2.2" ry="2.6" fill="#1D2A4A" />
      <path d="M36 36l8 2-8 3z" fill="#FF9E67" stroke="#1D2A4A" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M46 38c6-1 9 4 7 8-3 2-9 1-11-3" fill="#51BDD6" stroke="#1D2A4A" strokeWidth="2" />
      <rect x="47" y="40" width="6" height="7" rx="1.4" fill="#FFFDF8" stroke="#1D2A4A" strokeWidth="1.2" />
      <path d="M18 50l6 6M28 51l4 6" stroke="#FF9E67" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function money(n) {
  return `USD ${n.toLocaleString()}`;
}

// Normalize a stored time string (e.g. "8:30", "08:30") to the HH:MM value
// that <input type="time"> expects. Falls back to empty if unparseable.
function toTimeValue(time) {
  if (!time) return "";
  const match = String(time).match(/(\d{1,2}):(\d{2})/);
  if (!match) return "";
  const hh = String(Math.min(23, Number(match[1]))).padStart(2, "0");
  return `${hh}:${match[2]}`;
}

// Keep whatever the input gives us (already HH:MM), guarding empty edits.
function fromTimeValue(value) {
  return value || "00:00";
}

// Convert a stored time string to minutes-since-midnight for sorting.
// Unparseable/empty times sort to the end of the day.
function timeToMinutes(time) {
  const v = toTimeValue(time);
  if (!v) return Number.MAX_SAFE_INTEGER;
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
}

// Return a copy of a stop list sorted chronologically by time.
function sortStopsByTime(list) {
  return [...list].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("feed");
  const [tripTab, setTripTab] = useState("plan");
  const [overlay, setOverlay] = useState(null);
  const [posts, setPosts] = useState(initialPosts);
  const [pins, setPins] = useState(initialPins);
  const [plan, setPlan] = useState(initialPlan);
  const [trips, setTrips] = useState(initialTrips);
  const [tripId, setTripId] = useState("tokyo");
  const [day, setDay] = useState("18 Apr");
  const [budgets, setBudgets] = useState(initialBudgets);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [messages, setMessages] = useState(initialMessages);
  const [albums, setAlbums] = useState(initialAlbums);
  const [filter, setFilter] = useState("all");
  const [extraTypes, setExtraTypes] = useState([]);
  const [filterDraft, setFilterDraft] = useState({ label: "", place: "", note: "" });
  const [extraReviews, setExtraReviews] = useState({});
  const [query, setQuery] = useState("");
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [copyTarget, setCopyTarget] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [popup, setPopup] = useState(false);
  const [recording, setRecording] = useState(false);
  const [trail, setTrail] = useState([{ lat: 35.658, lng: 139.7016 }]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPos, setAiPos] = useState({ x: 322, y: 520 });
  const [aiSide, setAiSide] = useState("right");
  const [aiChat, setAiChat] = useState([
    {
      me: false,
      text: "I can draft itineraries, sync group taste, replan a delay, or split a bill. Drag this button if it sits on the wrong side.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [comment, setComment] = useState("");
  const [chatText, setChatText] = useState("");
  const [labelDraft, setLabelDraft] = useState("");
  const [postDraft, setPostDraft] = useState({
    text: "",
    place: "Shibuya Crossing",
  });
  const [tripDraft, setTripDraft] = useState({
    name: "Osaka food week",
    city: "Osaka",
    dates: "2–6 Jun",
    days: "3",
    ideal: "900",
  });
  const [split, setSplit] = useState({
    title: "Dinner · Omoide Yokocho",
    amount: "86",
    payer: "maya",
    method: "equal",
    people: ["maya", "ken", "aisha", "jun"],
  });
  const [friendQuery, setFriendQuery] = useState("");
  const [myFriends, setMyFriends] = useState(friendIds);
  const [authForm, setAuthForm] = useState({ email: "maya@jigo.app", pass: "••••••••" });
  const drag = useRef(null);

  const allTypes = [...pinTypes, ...extraTypes];
  const trip = trips.find((t) => t.id === tripId);
  const dayPlan = plan[tripId]?.[day] || [];
  const venues = [...pins]
    .filter((p) => p.type === "venue")
    .sort((a, b) => b.likes - a.likes);

  function toast(text) {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }

  function goFrame(id) {
    if (id === "login") {
      setAuthed(false);
      setOverlay(null);
      return;
    }
    setAuthed(true);
    setPopup(false);
    if (id === "compose" || id === "add") {
      setOverlay("compose");
      return;
    }
    setOverlay(null);
    if (id === "budget") {
      setTab("trip");
      setTripTab("budget");
      return;
    }
    if (id === "chat") {
      setTab("trip");
      setTripTab("chat");
      return;
    }
    if (id === "trip") {
      setTab("trip");
      setTripTab("plan");
      return;
    }
    setTab(id);
  }

  function login() {
    setAuthed(true);
    setTab("feed");
    setPopup(true);
  }

  function toggleLike(id) {
    setPosts((all) =>
      all.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
          : p
      )
    );
  }

  function addComment(postId) {
    if (!comment.trim()) return;
    setPosts((all) =>
      all.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: crypto.randomUUID(), author: "maya", text: comment },
              ],
            }
          : p
      )
    );
    setComment("");
    toast("Comment posted");
  }

  function copyToPlan(post, tripName = tripId, customTime = "15:30", targetDay) {
    const tripObj = trips.find((t) => t.id === tripName);
    const chosenDay = targetDay && tripObj.days.includes(targetDay) ? targetDay : tripObj.days[0];
    setPlan((prev) => ({
      ...prev,
      [tripName]: {
        ...prev[tripName],
        [chosenDay]: sortStopsByTime([
          ...(prev[tripName][chosenDay] || []),
          {
            id: crypto.randomUUID(),
            time: customTime,
            title: post.place,
            pinId: post.pinId,
            rating: 4.6,
            note: post.text.slice(0, 42),
          },
        ]),
      },
    }));
    setCopyTarget(null);
    toast(`Copied into ${tripObj.name} · ${chosenDay} · slotted by time`);
  }

  function pinPostToMap(post) {
    toast(`${post.place} pinned on map`);
    setTab("map");
    setSelectedPin(post.pinId);
    setFilter("venue");
  }

  function addWaypoint(pin) {
    setPlan((prev) => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        [day]: sortStopsByTime([
          ...(prev[tripId][day] || []),
          {
            id: crypto.randomUUID(),
            time: "13:10",
            title: `Stop · ${pin.name}`,
            pinId: pin.id,
            rating: pin.rating,
            note: "Added from map",
          },
        ]),
      },
    }));
    toast("Stop added · slotted by time");
  }

  function saveLabel(pinId) {
    setPins((all) =>
      all.map((p) => (p.id === pinId ? { ...p, customLabel: labelDraft } : p))
    );
    toast("Personal label saved");
  }

  function reorderStop(fromIndex, toIndex) {
    setPlan((prev) => {
      const list = [...(prev[tripId]?.[day] || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= list.length ||
        toIndex >= list.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }
      // Time slots stay anchored to their row positions: keep the ascending
      // list of times, move the stop content, then reassign times by position.
      const times = list.map((item) => item.time).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      const next = list.map((item, i) => ({ ...item, time: times[i] }));
      return {
        ...prev,
        [tripId]: { ...prev[tripId], [day]: next },
      };
    });
  }

  function moveStop(index, dir) {
    reorderStop(index, index + dir);
  }

  function sortDay() {
    setPlan((prev) => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        [day]: sortStopsByTime(prev[tripId]?.[day] || []),
      },
    }));
    toast("Schedule sorted by time");
  }

  function deleteStop(stopId) {
    setPlan((prev) => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        [day]: (prev[tripId]?.[day] || []).filter((item) => item.id !== stopId),
      },
    }));
    toast("Stop removed from the plan");
  }

  function addVenueStop(venue, customTime = "12:00") {
    setPlan((prev) => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        [day]: sortStopsByTime([
          ...(prev[tripId]?.[day] || []),
          {
            id: crypto.randomUUID(),
            time: customTime,
            title: venue.name,
            pinId: venue.id,
            rating: venue.rating,
            note: venue.note || "Added from venue list",
          },
        ]),
      },
    }));
    toast(`${venue.name} added to ${day}`);
  }

  function editStopTime(stopId, time) {
    setPlan((prev) => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        [day]: (prev[tripId]?.[day] || []).map((item) =>
          item.id === stopId ? { ...item, time } : item
        ),
      },
    }));
  }

  function addMessage(entry, targetTrip = tripId) {
    setMessages((all) => ({
      ...all,
      [targetTrip]: [...(all[targetTrip] || []), entry],
    }));
  }

  function sharePin(pin) {
    addMessage({
      id: crypto.randomUUID(),
      author: "maya",
      text: `Shared ${pin.name} with the group`,
      time: "now",
      kind: "location",
      place: pin.name,
    });
    toast(`Location shared with ${Math.max(0, trip.members.length - 1)} partners`);
    setTab("trip");
    setTripTab("chat");
  }

  function publishPost() {
    const next = {
      id: crypto.randomUUID(),
      author: "maya",
      place: postDraft.place,
      pinId: "shibuya",
      time: "Just now",
      photo:
        "https://images.unsplash.com/photo-1503899036084-c55cdd74cb4d?w=900&h=1100&fit=crop",
      text: postDraft.text || "Dropped a pin from the street.",
      likes: 0,
      liked: false,
      comments: [],
    };
    setPosts((p) => [next, ...p]);
    setOverlay(null);
    setTab("feed");
    toast("Post published");
  }

  function sendChat(kind = "text", extra = {}) {
    const text = extra.text || chatText;
    if (kind === "text" && !text.trim()) return;
    addMessage({
      id: crypto.randomUUID(),
      author: "maya",
      text: text || extra.label,
      time: "now",
      kind,
      ...extra,
    });
    setChatText("");
  }

  function createAlbum() {
    const name = `${trip?.city || trip?.name || "Trip"} · ${albums.length + 1}`;
    setAlbums((a) => [
      {
        id: crypto.randomUUID(),
        name,
        count: 1,
        cover:
          "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&h=400&fit=crop",
      },
      ...a,
    ]);
    sendChat("album", { label: `Album created: ${name}`, album: name, text: `Album created: ${name}` });
    toast("Album saved to profile");
  }

  function confirmSplit() {
    const amount = Number(split.amount) || 0;
    const share = amount / split.people.length;
    setExpenses((e) => [
      {
        id: crypto.randomUUID(),
        tripId,
        title: split.title,
        amount,
        payer: split.payer,
        split: split.people,
        time: "Live",
        live: true,
      },
      ...e,
    ]);
    setBudgets((b) => {
      const next = { ...b[tripId] };
      split.people.forEach((id) => {
        next[id] = {
          ...next[id],
          actual: Number((next[id].actual + share).toFixed(0)),
        };
      });
      return { ...b, [tripId]: next };
    });
    setOverlay(null);
    toast("Expense recorded · actuals updated live");
  }

  function openExpense() {
    const members = trip?.members || ["maya"];
    setSplit((s) => ({
      ...s,
      payer: members.includes(s.payer) ? s.payer : members[0],
      people: members,
    }));
    setOverlay("split");
  }

  function createTrip() {
    const id = `trip-${crypto.randomUUID().slice(0, 8)}`;
    const dayCount = Math.max(1, Number(tripDraft.days) || 3);
    const days = Array.from({ length: dayCount }, (_, i) => `Day ${i + 1}`);
    const nextTrip = {
      id,
      name: tripDraft.name || "New trip",
      city: tripDraft.city || "TBD",
      dates: tripDraft.dates || "Draft",
      cover:
        "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=500&fit=crop",
      members: ["maya"],
      days,
    };
    setTrips((t) => [...t, nextTrip]);
    setPlan((p) => ({
      ...p,
      [id]: Object.fromEntries(days.map((d) => [d, []])),
    }));
    setBudgets((b) => ({
      ...b,
      [id]: { maya: { ideal: Number(tripDraft.ideal) || 900, actual: 0 } },
    }));
    setMessages((all) => ({
      ...all,
      [id]: [],
    }));
    setTripId(id);
    setDay(days[0]);
    setTab("trip");
    setTripTab("plan");
    setOverlay(null);
    toast(`${nextTrip.name} created`);
  }

  function askAi(text) {
    const q = text || aiInput;
    if (!q.trim()) return;
    const hit = aiReplies.find((r) => r.match.test(q));
    setAiChat((c) => [
      ...c,
      { me: true, text: q },
      {
        me: false,
        text: hit
          ? hit.text
          : "I can keep this in the Tokyo queue, mark it as a stop, or turn it into a split. Tell me budget, time, or who is coming.",
      },
    ]);
    setAiInput("");
  }

  function applyReplan() {
    setPlan((prev) => ({
      ...prev,
      tokyo: {
        ...prev.tokyo,
        "18 Apr": [
          { id: "r1", time: "10:30", title: "Senso-ji Temple", pinId: "sensoji", rating: 4.8, note: "Kept · delay-safe" },
          { id: "r2", time: "14:00", title: "Tsukiji Outer Market", pinId: "tsukiji", rating: 4.6, note: "Pushed +90m" },
          { id: "r3", time: "18:30", title: "teamLab Planets", pinId: "teamlab", rating: 4.7, note: "Last entry" },
        ],
      },
    }));
    setPopup(false);
    setTab("trip");
    setTripTab("plan");
    toast("Day 1 rewritten around NH812");
  }

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => {
      setTrail((pts) => {
        const last = pts[pts.length - 1];
        return [
          ...pts,
          {
            lat: last.lat + 0.0007 + Math.random() * 0.0004,
            lng: last.lng + 0.0009 + Math.random() * 0.0005,
          },
        ];
      });
    }, 900);
    return () => clearInterval(t);
  }, [recording]);

  function onFabDown(e) {
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    drag.current = {
      dx: e.clientX - rect.left - aiPos.x,
      dy: e.clientY - rect.top - aiPos.y,
    };
    const move = (ev) => {
      if (!drag.current) return;
      const x = ev.clientX - rect.left - drag.current.dx;
      const y = ev.clientY - rect.top - drag.current.dy;
      const chatClear = tab === "trip" && tripTab === "chat";
      setAiPos({
        x: Math.max(12, Math.min(330, x)),
        y: Math.max(70, Math.min(chatClear ? 500 : 620, y)),
      });
    };
    const up = () => {
      drag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  useEffect(() => {
    setAiPos((p) => ({ ...p, x: aiSide === "right" ? 322 : 16 }));
  }, [aiSide]);

  useEffect(() => {
    if (tab === "trip" && tripTab === "chat") {
      setAiPos((p) => ({ ...p, y: Math.min(p.y, 500) }));
    }
  }, [tab, tripTab]);

  const shownPins = pins.filter((p) => {
    const typeOk = filter === "all" || p.type === filter;
    const q = query.trim().toLowerCase();
    return typeOk && (!q || p.name.toLowerCase().includes(q) || p.note.toLowerCase().includes(q));
  });

  function applyMapFilter(id) {
    setFilter(id);
    setQuery("");
    const match = pins.find((p) => id === "all" || p.type === id);
    if (match) setSelectedPin(match.id);
  }

  function addCustomPlace(typeId) {
    const place = filterDraft.place.trim();
    if (!place) return;
    const pin = {
      id: crypto.randomUUID(),
      type: typeId,
      name: place,
      lat: 35.6812,
      lng: 139.7671,
      rating: 4.5,
      likes: 1,
      reviews: 1,
      source: "In-app",
      note: filterDraft.note.trim() || "Added by you",
      customLabel: "",
    };
    setPins((p) => [...p, pin]);
    setSelectedPin(pin.id);
    setFilter(typeId);
    setQuery("");
    setFilterDraft({ label: "", place: "", note: "" });
    setOverlay(null);
    toast(`${place} added to the filter`);
  }

  function createFilter() {
    const label = filterDraft.label.trim();
    if (!label) return;
    const id = `custom-${crypto.randomUUID().slice(0, 8)}`;
    setExtraTypes((t) => [...t, { id, label }]);
    if (filterDraft.place.trim()) {
      addCustomPlace(id);
      return;
    }
    setFilter(id);
    setQuery("");
    setFilterDraft({ label: "", place: "", note: "" });
    setOverlay(null);
    toast(`${label} filter added`);
  }

  const hints = useMemo(
    () => searchHints.filter((h) => !query || h.includes(query.toLowerCase()) || query.length < 2),
    [query]
  );

  const groupBudget = Object.values(budgets[tripId] || {}).reduce(
    (acc, b) => ({
      ideal: acc.ideal + b.ideal,
      actual: acc.actual + b.actual,
    }),
    { ideal: 0, actual: 0 }
  );

  const currentFrame = !authed
    ? "login"
    : overlay === "compose" || overlay === "add" || overlay === "createTrip" || overlay === "split"
      ? "compose"
      : tab === "trip"
        ? tripTab === "budget"
          ? "budget"
          : tripTab === "chat"
            ? "chat"
            : "trip"
        : tab;

  return (
    <div className="studio">
      <aside className="rail">
        <div>
          <div className="brand-mark">
            <Logo size={32} />
            <b>JIGo</b>
            <span>prototype</span>
          </div>
          <p>Clickable mobile studio. Use the phone, or jump frames like Figma pages.</p>
        </div>
        <div className="frame-list">
          {frames.map((f) => (
            <button key={f.id} className={currentFrame === f.id ? "on" : ""} onClick={() => goFrame(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <p>Drag the navy AI button. New expenses update each person’s actual budget live.</p>
      </aside>

      <div className="device-wrap">
        <div className="device">
          <div className="device-screen">
            <div className="island" />
            <div className="status-bar">
              <span>9:41</span>
              <span>5G  ██</span>
            </div>
            <div className="app">
              <div className="toast-stack">
                {toasts.map((t) => (
                  <div className="toast" key={t.id}>
                    {t.text}
                  </div>
                ))}
              </div>

              {!authed ? (
                <Auth form={authForm} setForm={setAuthForm} onLogin={login} />
              ) : (
                <>
                  {tab === "feed" && (
                    <Feed
                      posts={posts}
                      onLike={toggleLike}
                      onOpen={(p) => {
                        setSelectedPost(p);
                        setOverlay("post");
                      }}
                      onCopy={(p) => {
                        setCopyTarget(p);
                        setOverlay("copy");
                      }}
                      onPin={pinPostToMap}
                      onNotify={() => setOverlay("notes")}
                    />
                  )}
                  {tab === "map" && (
                    <MapScreen
                      pins={shownPins}
                      filter={filter}
                      setFilter={applyMapFilter}
                      query={query}
                      setQuery={setQuery}
                      hints={hints}
                      selected={selectedPin}
                      setSelected={setSelectedPin}
                      recording={recording}
                      setRecording={setRecording}
                      trail={trail}
                      setTrail={setTrail}
                      onOpenPin={(id) => {
                        setSelectedPin(id);
                        setLabelDraft(pins.find((p) => p.id === id)?.customLabel || "");
                        setOverlay("pin");
                      }}
                      types={allTypes}
                      onAddFilter={() => {
                        setFilterDraft({ label: "", place: "", note: "" });
                        setOverlay("addFilter");
                      }}
                      onAddPlace={() => {
                        setFilterDraft({ label: "", place: "", note: "" });
                        setOverlay("addPlace");
                      }}
                    />
                  )}
                  {tab === "trip" && (
                    <TripScreen
                      trip={trip}
                      trips={trips}
                      tripId={tripId}
                      setTripId={(id) => {
                        setTripId(id);
                        setDay(trips.find((t) => t.id === id).days[0]);
                        setChatText("");
                      }}
                      tripTab={tripTab}
                      setTripTab={setTripTab}
                      day={day}
                      setDay={setDay}
                      dayPlan={dayPlan}
                      venues={venues}
                      budgets={budgets[tripId]}
                      groupBudget={groupBudget}
                      setBudgets={setBudgets}
                      tripKey={tripId}
                      expenses={expenses.filter((e) => e.tripId === tripId)}
                      messages={Array.isArray(messages) ? [] : messages[tripId] || []}
                      chatText={chatText}
                      setChatText={setChatText}
                      onSend={sendChat}
                      onAlbum={createAlbum}
                      onSplit={openExpense}
                      onReorderStop={reorderStop}
                      onMoveStop={moveStop}
                      onEditStopTime={editStopTime}
                      onSortDay={sortDay}
                      onDeleteStop={deleteStop}
                      onAddVenueStop={addVenueStop}
                      onMapItem={(pinId) => {
                        setTab("map");
                        setSelectedPin(pinId);
                      }}
                    />
                  )}
                  {tab === "profile" && (
                    <Profile
                      albums={albums}
                      friends={myFriends}
                      tripCount={trips.length}
                      aiSide={aiSide}
                      setAiSide={setAiSide}
                      onAddFriend={() => setOverlay("friend")}
                    />
                  )}

                  <nav className="tabbar">
                    <button className={tab === "feed" ? "on" : ""} onClick={() => setTab("feed")}>
                      <Icon d="M4 11l8-7 8 7v8a2 2 0 01-2 2h-4v-6H10v6H6a2 2 0 01-2-2z" />
                      Feed
                    </button>
                    <button className={tab === "map" ? "on" : ""} onClick={() => setTab("map")}>
                      <Icon d="M9 20l-5-2V4l5 2 6-2 5 2v14l-5-2-6 2z" />
                      Map
                    </button>
                    <button onClick={() => setOverlay("compose")} aria-label="Create">
                      <span className="add-tab">+</span>
                    </button>
                    <button className={tab === "trip" ? "on" : ""} onClick={() => setTab("trip")}>
                      <Icon d="M4 7h16M4 12h10M4 17h16" />
                      Trip
                    </button>
                    <button className={tab === "profile" ? "on" : ""} onClick={() => setTab("profile")}>
                      <Icon d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" />
                      Me
                    </button>
                  </nav>

                  {!aiOpen && (
                    <button
                      className={`ai-fab ${tab === "trip" && tripTab === "chat" ? "lifted" : ""}`}
                      style={{ left: aiPos.x, top: aiPos.y }}
                      onPointerDown={onFabDown}
                      onClick={() => setAiOpen(true)}
                    >
                      AI
                    </button>
                  )}

                  {aiOpen && (
                    <div className="ai-sheet">
                      <header>
                        <div>
                          <b>JIGo agent</b>
                          <div className="muted">Sits above the tab bar · drag the FAB to move</div>
                        </div>
                        <button className="mini" onClick={() => setAiOpen(false)}>
                          Minimize
                        </button>
                      </header>
                      <div className="ai-log">
                        {aiChat.map((m, i) => (
                          <div key={i} className={`bubble ${m.me ? "me" : ""}`}>
                            {m.text}
                          </div>
                        ))}
                        <div className="chips">
                          {["Replan NH812 delay", "3-day Tokyo under 800", "How should we split?"].map((s) => (
                            <button key={s} className="chip" onClick={() => askAi(s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="composer" style={{ padding: 12 }}>
                        <input
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          placeholder="Ask to plan, replan, or split"
                        />
                        <button className="btn" onClick={() => askAi()}>
                          Send
                        </button>
                      </div>
                    </div>
                  )}

                  {popup && !overlay && (
                    <div className="popup">
                      <h4>NH812 delayed 2 hours</h4>
                      <p>Day 1 no longer fits. JIGo can rewrite the queue around Senso-ji, Tsukiji, and teamLab.</p>
                      <div className="row">
                        <button className="btn coral" onClick={applyReplan}>
                          Replan now
                        </button>
                        <button className="btn ghost" style={{ color: "#ffffff" }} onClick={() => setPopup(false)}>
                          Later
                        </button>
                      </div>
                    </div>
                  )}

                  {overlay === "post" && selectedPost && (
                    <PostSheet
                      post={selectedPost}
                      comment={comment}
                      setComment={setComment}
                      onClose={() => setOverlay(null)}
                      onComment={() => addComment(selectedPost.id)}
                      onCopy={() => {
                        setCopyTarget(selectedPost);
                        setOverlay("copy");
                      }}
                      onPin={() => {
                        setOverlay(null);
                        pinPostToMap(selectedPost);
                      }}
                    />
                  )}

                  {overlay === "copy" && copyTarget && (
                    <CopySheet
                      post={copyTarget}
                      trips={trips}
                      onClose={() => setOverlay(null)}
                      onCopy={copyToPlan}
                    />
                  )}

                  {overlay === "pin" && selectedPin && (
                    <PinSheet
                      pin={pins.find((p) => p.id === selectedPin)}
                      types={allTypes}
                      extraReviews={extraReviews[selectedPin] || []}
                      labelDraft={labelDraft}
                      setLabelDraft={setLabelDraft}
                      onSave={() => saveLabel(selectedPin)}
                      onReview={(review) =>
                        setExtraReviews((r) => ({
                          ...r,
                          [selectedPin]: [review, ...(r[selectedPin] || [])],
                        }))
                      }
                      onClose={() => setOverlay(null)}
                      onWaypoint={() => addWaypoint(pins.find((p) => p.id === selectedPin))}
                      onShare={() => sharePin(pins.find((p) => p.id === selectedPin))}
                    />
                  )}

                  {overlay === "addFilter" && (
                    <FilterSheet
                      mode="filter"
                      draft={filterDraft}
                      setDraft={setFilterDraft}
                      onClose={() => setOverlay(null)}
                      onSave={createFilter}
                    />
                  )}

                  {overlay === "addPlace" && (
                    <FilterSheet
                      mode="place"
                      draft={filterDraft}
                      setDraft={setFilterDraft}
                      filterLabel={allTypes.find((t) => t.id === filter)?.label || "this filter"}
                      onClose={() => setOverlay(null)}
                      onSave={() => addCustomPlace(filter === "all" ? "venue" : filter)}
                    />
                  )}

                  {overlay === "compose" && (
                    <>
                      <button className="scrim" onClick={() => setOverlay(null)} aria-label="Close menu" />
                      <ComposeSheet
                        onPost={() => setOverlay("add")}
                        onTrip={() => setOverlay("createTrip")}
                        onExpense={openExpense}
                        onClose={() => setOverlay(null)}
                      />
                    </>
                  )}

                  {overlay === "add" && (
                    <AddPost
                      draft={postDraft}
                      setDraft={setPostDraft}
                      onClose={() => setOverlay(null)}
                      onPublish={publishPost}
                    />
                  )}

                  {overlay === "createTrip" && (
                    <CreateTrip
                      draft={tripDraft}
                      setDraft={setTripDraft}
                      onClose={() => setOverlay(null)}
                      onCreate={createTrip}
                    />
                  )}

                  {overlay === "split" && (
                    <SplitSheet
                      split={split}
                      setSplit={setSplit}
                      members={trip?.members || ["maya"]}
                      onClose={() => setOverlay(null)}
                      onConfirm={confirmSplit}
                    />
                  )}

                  {overlay === "notes" && (
                    <div className="sheet">
                      <h3>Notifications</h3>
                      <div className="card" style={{ padding: 12 }}>
                        <b>NH812 +2h</b>
                        <p className="muted">Realtime · tap to replan Day 1</p>
                        <button className="btn" onClick={applyReplan}>
                          Open replan
                        </button>
                      </div>
                      <div className="card" style={{ padding: 12 }}>
                        <b>Ken liked your Tsukiji pin</b>
                        <p className="muted">12 min ago</p>
                      </div>
                      <button className="btn ghost" onClick={() => setOverlay(null)}>
                        Close
                      </button>
                    </div>
                  )}

                  {overlay === "friend" && (
                    <div className="sheet">
                      <h3>Add friend</h3>
                      <input
                        placeholder="Search @handle"
                        value={friendQuery}
                        onChange={(e) => setFriendQuery(e.target.value)}
                      />
                      {Object.values(people)
                        .filter((p) => p.id !== "maya" && !myFriends.includes(p.id))
                        .map((p) => (
                          <div className="member" key={p.id}>
                            <img className="avatar" src={p.avatar} alt="" />
                            <div>
                              <b>{p.name}</b>
                              <div className="muted">{p.handle}</div>
                            </div>
                            <button
                              className="mini"
                              onClick={() => {
                                setMyFriends((f) => [...f, p.id]);
                                toast(`Added ${p.name}`);
                              }}
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      <p className="muted">Everyone in Tokyo Spring is already on your list.</p>
                      <button className="btn ghost" onClick={() => setOverlay(null)}>
                        Done
                      </button>
                    </div>
                  )}
                </>
              )}
              <div className="home-bar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposeSheet({ onPost, onTrip, onExpense, onClose }) {
  return (
    <div className="sheet">
      <h3>Create</h3>
      <p className="muted">Pick what you want to add right now.</p>
      <div className="compose-list">
        <button className="compose-item post" onClick={onPost}>
          <span className="compose-ico">
            <Icon d="M4 20h16M7 16l9-9 3 3-9 9H7z" />
          </span>
          <span>
            <b>Add post</b>
            <span>Write a journal with location and photos</span>
          </span>
        </button>
        <button className="compose-item trip" onClick={onTrip}>
          <span className="compose-ico">
            <Icon d="M3 10l18-6-6 18-3-7-9-5z" />
          </span>
          <span>
            <b>Create trip</b>
            <span>Start a new itinerary for solo or group travel</span>
          </span>
        </button>
        <button className="compose-item expense" onClick={onExpense}>
          <span className="compose-ico">
            <Icon d="M12 3v18M7 8h7a3 3 0 010 6H8a3 3 0 000 6h9" />
          </span>
          <span>
            <b>Add expense</b>
            <span>Log a cost anywhere and split it now</span>
          </span>
        </button>
      </div>
      <button className="btn ghost wide" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}

function CreateTrip({ draft, setDraft, onClose, onCreate }) {
  return (
    <div className="sheet">
      <h3>Create trip</h3>
      <p className="muted">Name the trip, set dates, and lock an ideal budget.</p>
      <label className="field">
        <span>Trip name</span>
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </label>
      <label className="field">
        <span>City</span>
        <input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
      </label>
      <label className="field">
        <span>Dates</span>
        <input value={draft.dates} onChange={(e) => setDraft({ ...draft, dates: e.target.value })} />
      </label>
      <label className="field">
        <span>Number of days</span>
        <input value={draft.days} onChange={(e) => setDraft({ ...draft, days: e.target.value })} />
      </label>
      <label className="field">
        <span>Your ideal budget (USD)</span>
        <input value={draft.ideal} onChange={(e) => setDraft({ ...draft, ideal: e.target.value })} />
      </label>
      <button className="btn wide" onClick={onCreate}>
        Create trip
      </button>
      <button className="btn ghost wide" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}

function Auth({ form, setForm, onLogin }) {
  const [mode, setMode] = useState("in");
  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="wordmark" style={{ marginBottom: 12 }}>
          <Logo size={52} />
          <b style={{ fontSize: 28 }}>JIGo</b>
        </div>
        <small>Lifestyle track</small>
        <h2>Plan the escape together</h2>
        <p>One place for the itinerary, the group, the money, and the last-minute rewrite.</p>
      </div>
      <label className="field">
        <span>Email</span>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} />
      </label>
      {mode === "up" && (
        <label className="field">
          <span>Display name</span>
          <input defaultValue="Maya Chen" />
        </label>
      )}
      <button className="btn wide" onClick={onLogin}>
        {mode === "in" ? "Enter JIGo" : "Create account"}
      </button>
      <button className="btn ghost wide" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "Need an account?" : "I already have one"}
      </button>
    </div>
  );
}

function Feed({ posts, onLike, onOpen, onCopy, onPin, onNotify }) {
  return (
    <div className="screen">
      <div className="topbar">
        <div className="wordmark">
          <Logo size={30} />
          <h1>JIGo</h1>
        </div>
        <button className="icon-btn" onClick={onNotify} aria-label="Notifications">
          <Icon d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2h16z" />
          <i className="dot" />
        </button>
      </div>
      <div className="chips">
        <button className="chip on">Tokyo Spring</button>
        <button className="chip">Solo Bali</button>
        <button className="chip">Following</button>
      </div>
      {posts.map((p) => {
        const author = people[p.author];
        return (
          <article className="card" key={p.id}>
            <img className="post-photo" src={p.photo} alt="" />
            <div className="post-body">
              <div className="who">
                <img className="avatar" src={author.avatar} alt="" />
                <div>
                  <b>{author.name}</b>
                  <span>
                    {p.place} · {p.time}
                  </span>
                </div>
              </div>
              <p style={{ margin: 0 }}>{p.text}</p>
              <div className="post-actions">
                <button className="mini" onClick={() => onLike(p.id)}>
                  {p.liked ? "Liked" : "Like"} · {p.likes}
                </button>
                <button className="mini" onClick={() => onOpen(p)}>
                  Comment · {p.comments.length}
                </button>
                <button className="mini" onClick={() => onPin(p)}>
                  Pin to map
                </button>
                <button className="mini" onClick={() => onCopy(p)}>
                  Copy to my plan
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MapScreen({
  pins,
  filter,
  setFilter,
  query,
  setQuery,
  hints,
  selected,
  setSelected,
  recording,
  setRecording,
  trail,
  setTrail,
  onOpenPin,
  types,
  onAddFilter,
  onAddPlace,
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem("jigo_gmaps_key") || "";
  const selectedPin = pins.find((p) => p.id === selected);

  return (
    <div className="screen no-pad map-screen">
      <div className="search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cafe, ATM, convenience store"
        />
        {query && (
          <div className="hints">
            {hints.map((h) => (
              <button key={h} onClick={() => setQuery(h)}>
                {h}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="map-canvas">
        {apiKey ? (
          <GoogleMapView
            apiKey={apiKey}
            pins={pins}
            selected={selected}
            query={query}
            trail={trail}
            onOpenPin={onOpenPin}
          />
        ) : (
          <GoogleMapEmbed pin={selectedPin} filter={filter} />
        )}
      </div>
      <div className="chips" style={{ position: "absolute", top: 58, left: 16, right: 16, zIndex: 3 }}>
        <button className={`chip ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>
          All
        </button>
        {types.map((t) => (
          <button key={t.id} className={`chip ${filter === t.id ? "on" : ""}`} onClick={() => setFilter(t.id)}>
            {t.label}
          </button>
        ))}
        <button className="chip add-filter" onClick={onAddFilter}>
          + Filter
        </button>
      </div>
      <div className="map-places">
        {pins.map((p) => (
          <button key={p.id} className={selected === p.id ? "on" : ""} onClick={() => onOpenPin(p.id)}>
            {p.name}
          </button>
        ))}
        {filter !== "all" && (
          <button className="on" onClick={onAddPlace}>
            + Place
          </button>
        )}
      </div>
      <div className="map-tools">
        <button
          className={`btn ${recording ? "coral" : ""}`}
          onClick={() => {
            if (!recording) {
              const start = pins.find((p) => p.id === selected) || pins[0];
              if (start?.lat != null) setTrail([{ lat: start.lat, lng: start.lng }]);
            }
            setRecording((v) => !v);
          }}
        >
          {recording ? "Stop trail" : "Start trail"}
        </button>
        <button className="mini" onClick={() => setSelected(null)}>
          Offline pack · Tokyo
        </button>
      </div>
    </div>
  );
}

function TripScreen({
  trip,
  trips,
  tripId,
  setTripId,
  tripTab,
  setTripTab,
  day,
  setDay,
  dayPlan,
  venues,
  budgets,
  groupBudget,
  setBudgets,
  tripKey,
  expenses,
  messages,
  chatText,
  setChatText,
  onSend,
  onAlbum,
  onSplit,
  onReorderStop,
  onMoveStop,
  onEditStopTime,
  onSortDay,
  onDeleteStop,
  onAddVenueStop,
  onMapItem,
}) {
  const [attachOpen, setAttachOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  return (
    <div className={`screen ${tripTab === "chat" ? "chat-mode" : ""}`}>
      <div className="trip-head">
        <div className="muted">{trip.dates}</div>
        <h2>{trip.name}</h2>
        <div className="faces">
          {trip.members.map((id) => (
            <img key={id} src={people[id].avatar} alt="" />
          ))}
        </div>
      </div>
      <div className="switcher">
        {trips.map((t) => (
          <button key={t.id} className="trip-card" onClick={() => setTripId(t.id)}>
            <img src={t.cover} alt="" />
            <span>{t.name}</span>
          </button>
        ))}
      </div>
      <div className="seg">
        <button className={tripTab === "plan" ? "on" : ""} onClick={() => setTripTab("plan")}>
          Plan
        </button>
        <button className={tripTab === "budget" ? "on" : ""} onClick={() => setTripTab("budget")}>
          Budget
        </button>
        <button className={tripTab === "chat" ? "on" : ""} onClick={() => setTripTab("chat")}>
          Chat
        </button>
      </div>

      {tripTab === "plan" && (
        <>
          <div className="chips">
            {trip.days.map((d) => (
              <button key={d} className={`chip ${day === d ? "on" : ""}`} onClick={() => setDay(d)}>
                {d}
              </button>
            ))}
          </div>
          {dayPlan.length > 1 && (
            <div className="plan-toolbar">
              <p className="muted" style={{ margin: 0 }}>
                Drag the ⠿ handle to reorder, or tap the arrows. Edit any time inline.
              </p>
              <button className="mini" onClick={onSortDay}>
                Auto-arrange by time
              </button>
            </div>
          )}
          <div className="timeline">
            {dayPlan.map((item, index) => (
              <div
                className={`t-item editable${dragIndex === index ? " dragging" : ""}${
                  overIndex === index && dragIndex !== null && dragIndex !== index ? " drop-target" : ""
                }`}
                key={item.id}
                draggable
                onDragStart={(e) => {
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (overIndex !== index) setOverIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) onReorderStop(dragIndex, index);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
              >
                <div className="t-item-head">
                  <span className="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">
                    ⠿
                  </span>
                  <input
                    className="time-input"
                    type="time"
                    value={toTimeValue(item.time)}
                    onChange={(e) => onEditStopTime(item.id, fromTimeValue(e.target.value))}
                    aria-label={`Time for ${item.title}`}
                  />
                  <div className="stop-order">
                    <button
                      className="order-btn"
                      onClick={() => onMoveStop(index, -1)}
                      disabled={index === 0}
                      aria-label="Move stop up"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="order-btn"
                      onClick={() => onMoveStop(index, 1)}
                      disabled={index === dayPlan.length - 1}
                      aria-label="Move stop down"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="order-btn delete"
                      onClick={() => onDeleteStop(item.id)}
                      aria-label={`Delete ${item.title}`}
                      title="Delete stop"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <b>{item.title}</b>
                <div className="muted">
                  ★ {item.rating} · {item.note}
                </div>
                {item.pinId && (
                  <button className="mini" style={{ marginTop: 8 }} onClick={() => onMapItem(item.pinId)}>
                    View map
                  </button>
                )}
              </div>
            ))}
            {dayPlan.length === 0 && (
              <p className="muted">Empty queue. Copy a post, add a stop from the map, or tap “+ Stop” on a venue below.</p>
            )}
          </div>
          <h4 style={{ margin: "18px 0 8px" }}>Venue list · sorted by likes</h4>
          <p className="muted" style={{ margin: "0 0 8px" }}>
            Tap “+ Stop” to drop a venue into {day}. It slots in by time; edit the time inline afterwards.
          </p>
          {venues.map((v) => (
            <div className="member" key={v.id}>
              <div className="icon-btn" style={{ width: 28, height: 28 }}>
                ★
              </div>
              <div>
                <b>{v.name}</b>
                <div className="muted">
                  {v.likes} likes · {v.rating}
                </div>
              </div>
              <div className="venue-actions">
                <button className="mini" onClick={() => onMapItem(v.id)}>
                  Map
                </button>
                <button className="mini add" onClick={() => onAddVenueStop(v)}>
                  + Stop
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {tripTab === "budget" && (
        <>
          <div className="budget-hero">
            <div className="row">
              <div>
                <div className="muted" style={{ color: "#c5d0e4" }}>
                  Group ideal
                </div>
                <div className="money">{money(groupBudget.ideal)}</div>
              </div>
              <div>
                <div className="muted" style={{ color: "#c5d0e4" }}>
                  Group actual
                </div>
                <div className="money">{money(groupBudget.actual)}</div>
              </div>
            </div>
            <p className="muted" style={{ color: "#c5d0e4", margin: "8px 0 0" }}>
              Live. New expenses write into actuals immediately.
            </p>
          </div>
          <button className="btn wide" style={{ margin: "4px 0 14px" }} onClick={onSplit}>
            Add expense
          </button>
          {trip.members.map((id) => {
            const b = budgets[id];
            const pct = Math.min(100, Math.round((b.actual / b.ideal) * 100));
            return (
              <div className="member" key={id} style={{ gridTemplateColumns: "28px 1fr" }}>
                <img className="avatar" src={people[id].avatar} alt="" />
                <div>
                  <b>{people[id].name}</b>
                  <div className="muted">
                    Ideal {money(b.ideal)} · Actual {money(b.actual)}
                  </div>
                  <div className="bar">
                    <i style={{ width: `${pct}%` }} />
                  </div>
                  {id === "maya" && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button
                        className="mini"
                        onClick={() =>
                          setBudgets((all) => ({
                            ...all,
                            [tripKey]: {
                              ...all[tripKey],
                              maya: { ...all[tripKey].maya, ideal: all[tripKey].maya.ideal + 50 },
                            },
                          }))
                        }
                      >
                        +50 ideal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {expenses.map((e) => (
            <div className="card" key={e.id} style={{ padding: 12 }}>
              <div className="row" style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{e.title}</b>
                <span>{money(e.amount)}</span>
              </div>
              <div className="muted">
                {people[e.payer].name} paid · split {e.split.length} ways
              </div>
              {e.live && <div className="live">LIVE · actuals updated</div>}
            </div>
          ))}
        </>
      )}

      {tripTab === "chat" && (
        <div className="chat-pane">
          <div className="chat-log">
            {messages.length === 0 && (
              <p className="muted">No messages in this trip yet. Say hi or attach something.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`bubble ${m.author === "maya" ? "me" : ""}`}>
                <div className="muted" style={{ color: m.author === "maya" ? "#eef8fb" : undefined }}>
                  {people[m.author].name} · {m.time}
                </div>
                {m.text}
                {m.place && <div className="note-box" style={{ marginTop: 8 }}>{m.place}</div>}
                {m.album && <div className="note-box" style={{ marginTop: 8 }}>Album · {m.album}</div>}
              </div>
            ))}
          </div>
          <div className="chat-dock">
            {attachOpen && (
              <div className="attach-menu">
                <button
                  onClick={() => {
                    onAlbum();
                    setAttachOpen(false);
                  }}
                >
                  Create album
                </button>
                <button
                  onClick={() => {
                    onSend("photo", { label: "Photo attached", text: "Photo · station board" });
                    setAttachOpen(false);
                  }}
                >
                  Photo
                </button>
                <button
                  onClick={() => {
                    onSend("video", { label: "Video attached", text: "Video · crossing" });
                    setAttachOpen(false);
                  }}
                >
                  Video
                </button>
                <button
                  onClick={() => {
                    onSend("doc", { label: "Document", text: "JR pass.pdf" });
                    setAttachOpen(false);
                  }}
                >
                  Document
                </button>
                <button
                  onClick={() => {
                    onSend("location", { place: "FamilyMart Kaminarimon", text: "Shared a location" });
                    setAttachOpen(false);
                  }}
                >
                  Location
                </button>
              </div>
            )}
            <div className="composer">
              <button
                className={`attach-btn ${attachOpen ? "on" : ""}`}
                onClick={() => setAttachOpen((v) => !v)}
                aria-label="Add to chat"
              >
                +
              </button>
              <input value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Message the trip" />
              <button className="btn" onClick={() => onSend("text")}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Profile({ albums, friends, tripCount, aiSide, setAiSide, onAddFriend }) {
  return (
    <div className="screen">
      <div className="profile-hero">
        <img className="avatar lg" src={me.avatar} alt="" />
        <div>
          <h2 style={{ margin: 0, fontFamily: "Instrument Serif, serif", fontWeight: 400 }}>{me.name}</h2>
          <div className="muted">
            {me.handle} · {me.city}
          </div>
        </div>
      </div>
      <div className="stat-row">
        <div className="stat">
          <b>{tripCount}</b>
          <span className="muted">Trips</span>
        </div>
        <div className="stat">
          <b>{friends.length}</b>
          <span className="muted">Friends</span>
        </div>
        <div className="stat">
          <b>{albums.length}</b>
          <span className="muted">Albums</span>
        </div>
      </div>
      <button className="btn wide" onClick={onAddFriend}>
        Add friend
      </button>
      <h4>Albums</h4>
      <div className="album-grid">
        {albums.map((a) => (
          <div key={a.id}>
            <img className="cover" src={a.cover} alt="" />
            <b>{a.name}</b>
            <div className="muted">{a.count} photos · saved to profile</div>
          </div>
        ))}
      </div>
      <h4>Offline maps</h4>
      <div className="card" style={{ padding: 12 }}>
        <b>Tokyo metro + walking</b>
        <p className="muted">Downloaded · 184 MB · available without signal</p>
        <button className="mini">Manage packs</button>
      </div>
      <h4>AI chatbox side</h4>
      <div className="chips">
        <button className={`chip ${aiSide === "left" ? "on" : ""}`} onClick={() => setAiSide("left")}>
          Left
        </button>
        <button className={`chip ${aiSide === "right" ? "on" : ""}`} onClick={() => setAiSide("right")}>
          Right
        </button>
      </div>
      <p className="muted">Or drag the black AI button anywhere above the tab bar.</p>
    </div>
  );
}

function PostSheet({ post, comment, setComment, onClose, onComment, onCopy, onPin }) {
  const author = people[post.author];
  return (
    <div className="sheet">
      <h3>{post.place}</h3>
      <div className="who">
        <img className="avatar" src={author.avatar} alt="" />
        <div>
          <b>{author.name}</b>
          <span>{post.time}</span>
        </div>
      </div>
      <p>{post.text}</p>
      {post.comments.map((c) => (
        <div className="member" key={c.id}>
          <img className="avatar" src={people[c.author].avatar} alt="" />
          <div>
            <b>{people[c.author].name}</b>
            <div>{c.text}</div>
          </div>
        </div>
      ))}
      <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment" />
      <div className="post-actions">
        <button className="btn" onClick={onComment}>
          Comment
        </button>
        <button className="mini" onClick={onPin}>
          Pin location to map
        </button>
        <button className="mini" onClick={onCopy}>
          Copy to my plan
        </button>
        <button className="btn ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function CopySheet({ post, trips, onClose, onCopy }) {
  const [tripName, setTripName] = useState(trips[0].id);
  const selectedTrip = trips.find((t) => t.id === tripName) || trips[0];
  const [day, setDay] = useState(selectedTrip.days[0]);
  const [time, setTime] = useState("15:30");

  // When the trip changes, reset the day to that trip's first day so the
  // picker never points at a day that doesn't belong to the selected trip.
  useEffect(() => {
    setDay(selectedTrip.days[0]);
  }, [tripName]);

  return (
    <div className="sheet">
      <h3>Copy to my plan</h3>
      <p className="muted">{post.place} will land in the plan queue. Pick the day and time — it slots in by time.</p>
      <label className="field">
        <span>Trip name</span>
        <select className="select" value={tripName} onChange={(e) => setTripName(e.target.value)}>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Day</span>
        <select className="select" value={day} onChange={(e) => setDay(e.target.value)}>
          {selectedTrip.days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Time in queue</span>
        <input value={time} onChange={(e) => setTime(e.target.value)} />
      </label>
      <button className="btn wide" onClick={() => onCopy(post, tripName, time, day)}>
        Paste into plan queue
      </button>
      <button className="btn ghost wide" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}

function PinSheet({
  pin,
  types,
  extraReviews,
  labelDraft,
  setLabelDraft,
  onSave,
  onReview,
  onClose,
  onWaypoint,
  onShare,
}) {
  const [reviewText, setReviewText] = useState("");
  const [reviewScore, setReviewScore] = useState(5);
  if (!pin) return null;
  const info = detailsFor(pin);
  const reviews = [...(extraReviews || []), ...info.reviews];
  return (
    <div className="sheet">
      <div className="muted">{(types || pinTypes).find((t) => t.id === pin.type)?.label}</div>
      <h3>{pin.name}</h3>
      <div className="place-score">
        <b>{pin.rating}</b>
        <span>{"★".repeat(Math.round(pin.rating))}{"☆".repeat(Math.max(0, 5 - Math.round(pin.rating)))}</span>
        <span className="muted">
          {(pin.reviews + reviews.length).toLocaleString()} reviews · {pin.source}
        </span>
      </div>
      <p className="muted">{info.address}</p>
      <p className="muted">{info.hours}{info.phone ? ` · ${info.phone}` : ""}</p>
      <p className="note-box">{pin.note}</p>
      {pin.customLabel && (
        <p>
          Personal label: <b>{pin.customLabel}</b>
        </p>
      )}
      <h4>Reviews</h4>
      {reviews.length === 0 && <p className="muted">No reviews yet. Be the first.</p>}
      {reviews.map((r, i) => (
        <div className="review" key={`${r.name}-${i}`}>
          <div className="review-top">
            <b>{r.name}</b>
            <span className="muted">
              {r.source} · {r.time}
            </span>
          </div>
          <div className="muted">{"★".repeat(r.rating)}{"☆".repeat(Math.max(0, 5 - r.rating))}</div>
          <p>{r.text}</p>
        </div>
      ))}
      <label className="field">
        <span>Your review</span>
        <div className="chips">
          {[5, 4, 3, 2, 1].map((n) => (
            <button key={n} className={`chip ${reviewScore === n ? "on" : ""}`} onClick={() => setReviewScore(n)}>
              {n}★
            </button>
          ))}
        </div>
        <textarea
          rows="3"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="What should the next traveler know?"
        />
      </label>
      <button
        className="btn wide"
        onClick={() => {
          if (!reviewText.trim()) return;
          onReview({
            name: "Maya Chen",
            source: "In-app",
            rating: reviewScore,
            time: "Just now",
            text: reviewText.trim(),
          });
          setReviewText("");
        }}
      >
        Post review
      </button>
      <label className="field">
        <span>Add personalized label</span>
        <input value={labelDraft} onChange={(e) => setLabelDraft(e.target.value)} placeholder="Maya: rainy-day backup" />
      </label>
      <button className="mini" onClick={onSave}>
        Save label
      </button>
      <div className="post-actions">
        <button className="btn" onClick={onWaypoint}>
          Add stop
        </button>
        <button className="mini" onClick={onShare}>
          Share to partner
        </button>
        <button className="btn ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function FilterSheet({ mode, draft, setDraft, filterLabel, onClose, onSave }) {
  const isFilter = mode === "filter";
  return (
    <div className="sheet">
      <h3>{isFilter ? "Add filter" : "Add place"}</h3>
      <p className="muted">
        {isFilter
          ? "Create your own map category, then drop a first place into it."
          : `Save a new spot under ${filterLabel}.`}
      </p>
      {isFilter && (
        <label className="field">
          <span>Filter name</span>
          <input
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="Onsen, luggage, wifi..."
          />
        </label>
      )}
      <label className="field">
        <span>Place name</span>
        <input
          value={draft.place}
          onChange={(e) => setDraft({ ...draft, place: e.target.value })}
          placeholder="Where is it?"
        />
      </label>
      <label className="field">
        <span>Note</span>
        <input
          value={draft.note}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          placeholder="Optional"
        />
      </label>
      <button className="btn wide" onClick={onSave}>
        {isFilter ? "Save filter" : "Save place"}
      </button>
      <button className="btn ghost wide" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}

function AddPost({ draft, setDraft, onClose, onPublish }) {
  return (
    <div className="sheet full">
      <h3>Add post</h3>
      <p className="muted">Write a travel journal with location and photos.</p>
      <img
        className="post-photo"
        src="https://images.unsplash.com/photo-1503899036084-c55cdd74cb4d?w=900&h=700&fit=crop"
        alt=""
        style={{ borderRadius: 16, margin: "8px 0 14px" }}
      />
      <button className="mini" style={{ marginBottom: 12 }}>
        Add another photo
      </button>
      <label className="field">
        <span>Location</span>
        <input
          value={draft.place}
          onChange={(e) => setDraft({ ...draft, place: e.target.value })}
          placeholder="Pin a place"
        />
      </label>
      <div className="muted">Time recorded · 9:41pm</div>
      <label className="field">
        <span>Caption</span>
        <textarea rows="4" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="What happened here?" />
      </label>
      <button className="btn wide" onClick={onPublish}>
        Publish journal
      </button>
      <button className="btn ghost wide" onClick={onClose}>
        Discard
      </button>
    </div>
  );
}

function SplitSheet({ split, setSplit, members, onClose, onConfirm }) {
  const toggle = (id) => {
    setSplit((s) => ({
      ...s,
      people: s.people.includes(id) ? s.people.filter((x) => x !== id) : [...s.people, id],
    }));
  };
  return (
    <div className="sheet">
      <h3>Add expense</h3>
      <label className="field">
        <span>What</span>
        <input value={split.title} onChange={(e) => setSplit({ ...split, title: e.target.value })} />
      </label>
      <label className="field">
        <span>Amount USD</span>
        <input value={split.amount} onChange={(e) => setSplit({ ...split, amount: e.target.value })} />
      </label>
      <label className="field">
        <span>Paid by</span>
        <select className="select" value={split.payer} onChange={(e) => setSplit({ ...split, payer: e.target.value })}>
          {members.map((id) => (
            <option key={id} value={id}>
              {people[id].name}
            </option>
          ))}
        </select>
      </label>
      <div className="chips">
        {["equal", "shares"].map((m) => (
          <button key={m} className={`chip ${split.method === m ? "on" : ""}`} onClick={() => setSplit({ ...split, method: m })}>
            {m === "equal" ? "Equal" : "By shares"}
          </button>
        ))}
      </div>
      {members.map((id) => (
        <button key={id} className={`chip ${split.people.includes(id) ? "on" : ""}`} onClick={() => toggle(id)}>
          {people[id].name}
        </button>
      ))}
      <p className="muted">
        Each person: USD{" "}
        {(Number(split.amount || 0) / Math.max(1, split.people.length)).toFixed(0)}
      </p>
      <button className="btn wide" onClick={onConfirm}>
        Save and split
      </button>
      <button className="btn ghost wide" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}
