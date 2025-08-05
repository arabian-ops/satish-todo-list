// App.jsx - Final Advanced To-Do App for Satish Khalid (Centered, Styled, Background Adjusted)
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { CSVLink } from "react-csv";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const FILTERS = {
  All: () => true,
  Active: (t) => !t.completed,
  Completed: (t) => t.completed,
};
const CATEGORIES = ["Work", "Personal", "Errand"];
const colors = { Low: "#4caf50", Medium: "#ff9800", High: "#f44336" };

function App() {
  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem("tasks") || "[]")
  );
  const [text, setText] = useState("");
  const [prio, setPrio] = useState("Medium");
  const [date, setDate] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [filter, setFilter] = useState("All");
  const [mode, setMode] = useState("dark");
  const [notify, setNotify] = useState(true);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const printableRef = useRef();

  useEffect(
    () => localStorage.setItem("tasks", JSON.stringify(tasks)),
    [tasks]
  );
  useEffect(() => {
    if (transcript) setText(transcript);
  }, [transcript]);

  const add = () => {
    if (!text.trim()) return;
    const t = {
      id: Date.now(),
      text,
      prio,
      date: date || null,
      cat,
      completed: false,
    };
    setTasks([t, ...tasks]);
    setText("");
    setDate("");
    setCat(CATEGORIES[0]);
    resetTranscript();
    if (notify && Notification.permission === "granted") {
      new Notification("Task added", { body: t.text });
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [r] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, r);
    setTasks(items);
  };

  const exportPDF = () => {
    html2canvas(printableRef.current).then((canvas) => {
      const pdf = new jsPDF("p", "pt", "a4");
      pdf.addImage(canvas.toDataURL(), "PNG", 20, 20, 560, 0);
      pdf.save("tasks.pdf");
    });
  };

  const csvData = tasks.map((t) => ({
    Text: t.text,
    Priority: t.prio,
    Date: t.date,
    Category: t.cat,
    Done: t.completed,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          mode === "dark"
            ? "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?fit=crop&w=1920&q=80')"
            : "linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('https://images.unsplash.com/photo-1606312619070-d43d7fdcde1e?fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: mode === "dark" ? "#eee" : "#222",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        ref={printableRef}
        style={{
          background: mode === "dark" ? "#1a1a1ad9" : "#ffffffda",
          padding: 25,
          borderRadius: 15,
          width: "100%",
          maxWidth: 700,
          boxShadow: "0 12px 35px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ textAlign: "left", marginBottom: 10 }}>
            Satish Khalid's To‑Do
          </h2>
          <button onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
            {mode === "dark" ? "🌞" : "🌙"}
          </button>
        </div>

        <div style={{ margin: "10px 0", display: "flex", gap: 10 }}>
          <button
            onClick={SpeechRecognition.startListening}
            title="Start Voice Input"
          >
            🎙️
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Task..."
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={prio} onChange={(e) => setPrio(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button onClick={add}>Add Task</button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            margin: "10px 0",
          }}
        >
          {Object.keys(FILTERS).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "#00bfa5" : "transparent",
                color:
                  mode === "dark" ? "#eee" : filter === f ? "#222" : "#555",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list">
            {(prov) => (
              <ul
                {...prov.droppableProps}
                ref={prov.innerRef}
                style={{
                  listStyle: "none",
                  padding: 0,
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                <AnimatePresence>
                  {tasks.filter(FILTERS[filter]).map((t, i) => (
                    <Draggable
                      key={t.id}
                      draggableId={t.id.toString()}
                      index={i}
                    >
                      {(p) => (
                        <motion.li
                          {...p.draggableProps}
                          {...p.dragHandleProps}
                          ref={p.innerRef}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          whileHover={{ scale: 1.02 }}
                          style={{
                            background: t.completed ? "#2f3e46" : "#354f52",
                            margin: "5px 0",
                            padding: "10px",
                            borderRadius: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            ...p.draggableProps.style,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 5,
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() =>
                                setTasks(
                                  tasks.map((x) =>
                                    x.id === t.id
                                      ? { ...x, completed: !x.completed }
                                      : x
                                  )
                                )
                              }
                            />
                            <span style={{ margin: "0 5px" }}>{t.text}</span>
                            <span
                              style={{
                                color: colors[t.prio],
                                fontWeight: "bold",
                              }}
                            >
                              ({t.prio})
                            </span>
                            <span style={{ marginLeft: 10, fontSize: 12 }}>
                              {t.date}
                            </span>
                            <span style={{ fontSize: 12, opacity: 0.7 }}>
                              [{t.cat}]
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setTasks(tasks.filter((x) => x.id !== t.id))
                            }
                          >
                            ✕
                          </button>
                        </motion.li>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {prov.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 15,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => setTasks(tasks.filter((t) => !t.completed))}>
            Clear Done
          </button>
          <CSVLink data={csvData} filename="tasks.csv">
            <button>Export CSV</button>
          </CSVLink>
          <button onClick={exportPDF}>Export PDF</button>
        </div>
      </div>
    </div>
  );
}

export default App;
