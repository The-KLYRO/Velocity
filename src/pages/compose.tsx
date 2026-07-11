import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Toast, EditorToolbar } from "../components/ui";
import { useTemplateStore } from "../stores/template-store";
import { useCampaignStore } from "../stores/campaign-store";
import { useSendingStore } from "../stores/sending-store";
import { useRecipientStore } from "../stores/recipient-store";
import { useSmtpStore } from "../stores/smtp-store";
import { useSettingsStore } from "../stores/settings-store";
import { useListStore } from "../stores/list-store";
import { getLastBroadcast, getSmtpAccountPassword, sendBroadcast } from "../lib/tauri-api";

const systemVars = ["{{first_name}}", "{{last_name}}", "{{email}}"];
const customVars = ["{{company}}", "{{industry}}", "{{last_order_id}}"];

export function ComposePage() {
  const { addTemplate } = useTemplateStore();
  const { addCampaign, addBroadcast, fetchCampaigns } = useCampaignStore();
  const { startSending, stopSending, isSending } = useSendingStore();
  const { recipients, fetchRecipients, addRecipient } = useRecipientStore();
  const { accounts, fetchAccounts } = useSmtpStore();
  const { signature, fetchSettings } = useSettingsStore();
  const { lists, fetchLists, createList, addMembersToList, deleteList, fetchListMembers } = useListStore();
  const activeAccount = accounts.find((a) => a.isConnected) ?? accounts[0] ?? null;
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaign");

  const [selectedList, setSelectedList] = useState<string>("__create__");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newListEmails, setNewListEmails] = useState("");
  const [createError, setCreateError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [validatingListId, setValidatingListId] = useState<string | null>(null);
  const [failedListId, setFailedListId] = useState<string | null>(null);
  const [bodyDragOver, setBodyDragOver] = useState(false);
  const [pendingListData, setPendingListData] = useState<{ name: string; desc: string; emails: string } | null>(null);
  const emailTextareaRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const dragVariableRef = useRef<string | null>(null);

  useEffect(() => {
    fetchRecipients();
    fetchAccounts();
    fetchSettings();
    fetchLists();
    fetchCampaigns();
  }, [fetchRecipients, fetchAccounts, fetchSettings, fetchLists, fetchCampaigns]);

  useEffect(() => {
    if (!campaignId) return;
    const loadLastBroadcast = async () => {
      const last = await getLastBroadcast(campaignId);
      if (last) {
        setSubject(last.subject);
      }
    };
    loadLastBroadcast();
  }, [campaignId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    if (body === "" && signature) {
      setBody(
        `<p>Hi {'{{first_name}}'},</p>\n<br />\n<p>\n  I noticed that your company, {'{{company}}'}, has been expanding its reach lately.\n  We've developed a high-velocity solution at Velocity that could streamline your\n  operations significantly.\n</p>\n<br />\n<p>Would you be open to a 5-minute chat next Tuesday?</p>\n<br />\n<p>${signature.replace(/\n/g, "<br />")}</p>`
      );
    }
  }, [signature]);

  useEffect(() => {
    if (bodyRef.current && bodyRef.current.innerHTML !== body) {
      bodyRef.current.innerHTML = body;
    }
  }, [body]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const wrapImages = () => {
      el.querySelectorAll("img:not(.img-wrapped)").forEach((img) => {
        img.classList.add("img-wrapped");
        const wrapper = document.createElement("div");
        wrapper.className = "img-wrapper";
        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        const btn = document.createElement("button");
        btn.className = "img-remove-btn";
        btn.innerHTML = "&#10005;";
        btn.type = "button";
        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const parent = wrapper.parentNode;
          parent?.removeChild(wrapper);
          setBody(el.innerHTML);
        });
        wrapper.appendChild(btn);

        let br = wrapper.nextSibling;
        if (!br || !(br instanceof HTMLBRElement)) {
          br = document.createElement("br");
          wrapper.parentNode?.insertBefore(br, wrapper.nextSibling);
        }
        moveCursorAfterElement(br as HTMLElement);
      });
    };

    wrapImages();

    const observer = new MutationObserver(wrapImages);
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [body]);

  const getRecipientCount = () => {
    const list = lists.find((l) => l.id === selectedList);
    return list?.memberCount ?? 0;
  };

  const getSelectedLabel = () => {
    if (selectedList === "__create__") return null;
    const list = lists.find((l) => l.id === selectedList);
    return list ? `${list.name} (${list.memberCount})` : null;
  };

  const handleListChange = (value: string) => {
    if (value === "__create__") {
      setShowCreateModal(true);
    } else {
      setSelectedList(value);
    }
    setShowDropdown(false);
  };

  const resetCreateForm = () => {
    setNewListName("");
    setNewListDesc("");
    setNewListEmails("");
    setCreateError("");
    setShowCreateModal(false);
    setPendingListData(null);
  };

  const parseEmails = (raw: string) => {
    const emailRegex = /^[a-zA-Z0-9]+(?:[.+_-][a-zA-Z0-9]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    const lines = raw.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);
    const valid: string[] = [];
    const invalid: string[] = [];
    for (const email of lines) {
      if (emailRegex.test(email)) valid.push(email);
      else invalid.push(email);
    }
    return { valid, invalid };
  };

  const { valid: validEmails, invalid: invalidEmails } = parseEmails(newListEmails);

  const handleCreateList = async () => {
    setCreateError("");

    if (!newListName.trim()) {
      setCreateError("Title is required");
      return;
    }

    if (validEmails.length === 0) {
      setCreateError("Enter at least one valid email (e.g. user@example.com)");
      return;
    }

    const listName = newListName;
    const listDesc = newListDesc;
    const rawEmails = newListEmails;

    setPendingListData({ name: listName, desc: listDesc, emails: rawEmails });
    setShowCreateModal(false);

    try {
      const list = await createList(listName, listDesc || undefined);
      if (!list) {
        setPendingListData(null);
        setToast({ message: "Failed to create list", type: "error" });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      setValidatingListId(list.id);
      setFailedListId(null);

      const addedIds: string[] = [];
      for (const email of validEmails) {
        const existing = recipients.find((r) => r.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          addedIds.push(existing.id);
        } else {
          const created = await addRecipient(email, email.split("@")[0]);
          if (created) addedIds.push(created.id);
        }
      }

      if (addedIds.length > 0) {
        await addMembersToList(list.id, addedIds);
      }

      setValidatingListId(null);
      setPendingListData(null);
      setSelectedList(list.id);
      await fetchLists();
      setToast({ message: `List "${list.name}" created with ${addedIds.length} recipients`, type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setValidatingListId(null);
      setFailedListId(pendingListData ? null : null);
      setToast({ message: `Error creating list: ${String(e)}`, type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const reopenCreateModal = (name: string, desc: string, emails: string, error: string) => {
    setNewListName(name);
    setNewListDesc(desc);
    setNewListEmails(emails);
    setCreateError(error);
    setShowCreateModal(true);
  };

  const jumpToInvalidEmail = (email: string) => {
    setTimeout(() => {
      const textarea = emailTextareaRef.current;
      if (!textarea) return;
      const text = textarea.value;
      const idx = text.indexOf(email);
      textarea.focus();
      if (idx !== -1) {
        textarea.setSelectionRange(idx, idx + email.length);
        const linesBefore = text.substring(0, idx).split("\n").length;
        const lineHeight = 18;
        textarea.scrollTop = Math.max(0, (linesBefore - 3) * lineHeight);
      }
    }, 50);
  };

  const handleDragStart = (e: React.DragEvent, variable: string) => {
    e.dataTransfer.setData("text/plain", variable);
    e.dataTransfer.effectAllowed = "copy";
    dragVariableRef.current = variable;
  };

  useEffect(() => {
    const handleWindowDrop = (e: DragEvent) => {
      const variable = dragVariableRef.current;
      if (!variable) return;
      e.preventDefault();

      const el = bodyRef.current;
      if (!el) return;
      el.focus();

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (el.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          range.insertNode(document.createTextNode(variable));
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          el.innerHTML += variable;
        }
      } else {
        el.innerHTML += variable;
      }
      setBody(el.innerHTML);
      dragVariableRef.current = null;
    };

    const handleWindowDragEnd = () => {
      dragVariableRef.current = null;
    };

    window.addEventListener("drop", handleWindowDrop, true);
    window.addEventListener("dragend", handleWindowDragEnd, true);
    return () => {
      window.removeEventListener("drop", handleWindowDrop, true);
      window.removeEventListener("dragend", handleWindowDragEnd, true);
    };
  }, []);

  const handleBodyDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBodyDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setBodyDragOver(true);
  };

  const handleBodyDragLeave = () => {
    setBodyDragOver(false);
  };

  const handleSubjectDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const variable = e.dataTransfer.getData("text/plain");
    if (variable) setSubject((prev) => prev + variable);
  };

  const handleSubjectDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const moveCursorAfterElement = (el: HTMLElement) => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.setStartAfter(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const handleBodyPaste = () => {
    const el = bodyRef.current;
    if (!el) return;

    setTimeout(() => {
      const images = el.querySelectorAll("img.img-wrapped");
      if (images.length > 0) {
        const lastWrapper = images[images.length - 1].closest(".img-wrapper");
        if (lastWrapper) {
          const br = lastWrapper.nextSibling;
          if (br instanceof HTMLElement) {
            moveCursorAfterElement(br);
          } else {
            moveCursorAfterElement(lastWrapper as HTMLElement);
          }
        }
      }
      setBody(el.innerHTML);
    }, 0);
  };

  const insertVariableAtCursor = (variable: string) => {
    const el = bodyRef.current;
    if (!el) return;
    el.focus();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (el.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(document.createTextNode(variable));
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        el.innerHTML += variable;
      }
    } else {
      el.innerHTML += variable;
    }
    setBody(el.innerHTML);
  };

  const handleSaveTemplate = async () => {
    await addTemplate({
      name: subject || "Untitled Template",
      subject,
      bodyHtml: body,
      variables: systemVars.concat(customVars).map((v) => v.replace(/[{}]/g, "")),
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleSendNow = async () => {
    if (!activeAccount || !body.trim() || !subject.trim()) return;
    const count = getRecipientCount();
    if (count === 0) return;

    startSending(`camp-${Date.now()}`, count);

    try {
      let targetCampaignId = campaignId;

      if (!targetCampaignId) {
        await addCampaign({ name: subject || "Quick Send", status: "active" });
        const campaigns = useCampaignStore.getState().campaigns;
        targetCampaignId = campaigns[0]?.id;
      }

      if (!targetCampaignId) {
        showToast("Failed to create campaign", "error");
        stopSending();
        return;
      }

      await addBroadcast({
        campaignId: targetCampaignId,
        subject: subject || "Quick Send",
        status: "draft",
        sentCount: 0,
        totalCount: count,
      });

      const latestBroadcasts = useCampaignStore.getState().broadcasts;
      const broadcastId = latestBroadcasts[0]?.id;
      if (!broadcastId) {
        showToast("Failed to create broadcast", "error");
        stopSending();
        return;
      }

      await fetchListMembers(selectedList);
      const members = useListStore.getState().listMembers;
      const emails = members.map((m) => m.email);

      if (emails.length === 0) {
        showToast("No recipient emails found", "error");
        stopSending();
        return;
      }

      let decryptedPassword = "";
      try {
        decryptedPassword = await getSmtpAccountPassword(activeAccount.id);
      } catch {
        showToast("Could not retrieve SMTP password. Please re-save the account with a password.", "error");
        stopSending();
        return;
      }

      const result = await sendBroadcast({
        campaignId: targetCampaignId,
        broadcastId,
        subject,
        bodyHtml: body,
        smtpHost: activeAccount.host,
        smtpPort: activeAccount.port,
        smtpEmail: activeAccount.email,
        smtpPassword: decryptedPassword,
        smtpEncryption: activeAccount.encryption,
        recipientEmails: emails,
      });

      stopSending();
      await fetchCampaigns();

      if (result.failed === 0) {
        showToast(`All ${result.sent} emails sent successfully!`, "success");
      } else {
        showToast(`Sent ${result.sent}/${result.total} emails. ${result.failed} failed.`, result.sent > 0 ? "success" : "error");
      }
    } catch (e) {
      stopSending();
      showToast(`Send failed: ${String(e)}`, "error");
    }
  };

  const inputStyle = { width: "100%", background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", borderRadius: 10, padding: "10px 14px", color: "var(--text0)", fontSize: 13, outline: "none" };

  return (
    <div style={{ display: "flex", gap: 16, height: "100%" }}>
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--stroke0)", display: "flex", flexDirection: "column", gap: 8 }}>
          {/* To - Custom Dropdown */}
          <div ref={dropdownRef} style={{ position: "relative", display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--stroke0)" }}>
            <span style={{ width: 64, color: "var(--text2)", fontSize: 12 }}>To</span>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "6px 10px", borderRadius: 8, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)" }}
            >
              {getSelectedLabel() ? (
                <span style={{ fontSize: 13, color: "var(--text0)" }}>{getSelectedLabel()}</span>
              ) : (
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Select a list...</span>
              )}
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text2)", transition: "transform 0.15s", transform: showDropdown ? "rotate(180deg)" : "rotate(0)" }}>expand_more</span>
            </div>

            {showDropdown && (
              <div style={{ position: "absolute", top: "100%", left: 64, right: 0, marginTop: 4, background: "var(--bg0)", border: "1px solid var(--stroke1)", borderRadius: 10, overflow: "hidden", zIndex: 50, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                <div
                  onClick={() => handleListChange("__create__")}
                  style={{ padding: "10px 14px", fontSize: 13, color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--stroke0)", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  Create New List
                </div>
                {lists.length === 0 ? (
                  <div style={{ padding: "14px 14px", fontSize: 12, color: "var(--text2)", textAlign: "center" }}>
                    No lists yet
                  </div>
                ) : lists.map((list) => (
                  <div
                    key={list.id}
                    onClick={() => handleListChange(list.id)}
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: selectedList === list.id ? "rgba(255,255,255,0.06)" : "transparent",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = selectedList === list.id ? "rgba(255,255,255,0.06)" : "transparent")}
                  >
                    <span style={{ color: "var(--text0)" }}>{list.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text2)" }}>{list.memberCount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
            <span style={{ width: 64, color: "var(--text2)", fontSize: 12 }}>Subject</span>
            <input
              style={{ flex: 1, background: "transparent", border: "none", color: "var(--text0)", fontSize: 13, outline: "none" }}
              placeholder="Add a subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onDrop={handleSubjectDrop}
              onDragOver={handleSubjectDragOver}
            />
          </div>
        </div>

        {/* Body */}
        <EditorToolbar editorRef={bodyRef} onContentChange={() => setBody(bodyRef.current?.innerHTML ?? "")} />
        <div style={{ flex: 1, padding: 18, background: bodyDragOver ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.2)", overflow: "auto", minHeight: 300, transition: "background 0.15s" }}
          onDrop={handleBodyDrop}
          onDragOver={handleBodyDragOver}
          onDragLeave={handleBodyDragLeave}
        >
          <div
            ref={bodyRef}
            className="body-editor"
            style={{ minHeight: "100%", outline: "none", fontSize: 14, lineHeight: 1.6, color: "var(--text0)" }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setBody(e.currentTarget.innerHTML)}
            onPaste={handleBodyPaste}
          />
        </div>

        {/* Footer */}
        <div style={{ padding: 12, borderTop: "1px solid var(--stroke0)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSaveTemplate} className="pillBtn" type="button">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
              {showSaved ? "Saved!" : "Save Template"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSendNow}
              className="pillBtn"
              type="button"
              disabled={getRecipientCount() === 0 || isSending}
              style={{
                background: isSending ? "var(--panel2)" : undefined,
                opacity: isSending ? 0.7 : 1,
                cursor: isSending ? "not-allowed" : undefined,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, animation: isSending ? "spin 1s linear infinite" : "none" }}>
                {isSending ? "progress_activity" : "send"}
              </span>
              {isSending ? "Sending..." : `Send to ${getRecipientCount()} recipients`}
            </button>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Variables */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 10 }}>Variables</div>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Tags</div>
            {systemVars.map((v) => (
              <div
                key={v}
                draggable
                onDragStart={(e) => handleDragStart(e, v)}
                onClick={() => insertVariableAtCursor(v)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 10px", borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--warn)" }}>{v}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text2)" }}>drag_indicator</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 8 }}>Custom Attributes</div>
            {customVars.map((v) => (
              <div
                key={v}
                draggable
                onDragStart={(e) => handleDragStart(e, v)}
                onClick={() => insertVariableAtCursor(v)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 10px", borderRadius: 12, background: "rgba(0,0,0,0.14)", border: "1px solid var(--stroke0)", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--warn)" }}>{v}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text2)" }}>drag_indicator</span>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Lists Panel */}
        {lists.length > 0 && (
          <div className="card card--pad">
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Saved Lists</div>
            <div style={{ display: "grid", gap: 6, maxHeight: 200, overflow: "auto" }}>
              {lists.map((list) => {
                const isFailed = failedListId === list.id;
                const isValidating = validatingListId === list.id;
                return (
                  <div
                    key={list.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: selectedList === list.id ? "rgba(255,255,255,0.08)" : "transparent",
                      border: `1px solid ${isFailed ? "var(--bad)" : "var(--stroke0)"}`,
                      cursor: validatingListId ? "default" : "pointer",
                      opacity: isValidating && !isFailed ? 0.6 : 1,
                    }}
                    onClick={() => { if (!validatingListId) setSelectedList(list.id); }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                        {list.name}
                        {isValidating && !isFailed && (
                          <span className="spinner" style={{ width: 10, height: 10 }} />
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: isFailed ? "var(--bad)" : "var(--text2)" }}>
                        {isFailed ? "Validation failed — click Fix" : `${list.memberCount} members`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {isFailed ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reopenCreateModal(
                              pendingListData?.name ?? list.name,
                              pendingListData?.desc ?? "",
                              pendingListData?.emails ?? "",
                              "Some emails are invalid. Please correct them."
                            );
                          }}
                          style={{ background: "var(--bad)", border: "none", color: "#fff", cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600 }}
                          type="button"
                        >
                          Fix
                        </button>
                      ) : !validatingListId ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteList(list.id); if (selectedList === list.id) setSelectedList("__create__"); }}
                          style={{ background: "none", border: "none", color: "var(--bad)", cursor: "pointer", padding: 4 }}
                          type="button"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create New List Modal */}
      {showCreateModal && (
        <div
          key={createError ? "edit" : "create"}
          style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) resetCreateForm(); }}
        >
          <div className="card card--pad" style={{ width: 520, maxWidth: "90vw" }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: createError ? "var(--bad)" : "var(--primary)" }}>
                {createError ? "edit" : "playlist_add"}
              </span>
              {createError ? "Edit Recipient List" : "Create New Recipient List"}
            </div>

            {createError && (
              <div style={{ fontSize: 11, color: "var(--bad)", padding: "8px 12px", borderRadius: 8, background: "rgba(255,71,71,0.1)", marginBottom: 12 }}>{createError}</div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Leads"
                  value={newListName}
                  onChange={(e) => { setNewListName(e.target.value); setCreateError(""); }}
                  autoFocus
                  style={{ ...inputStyle, borderColor: createError && !newListName.trim() ? "var(--bad)" : undefined }}
                />
                {createError && !newListName.trim() && (
                  <div style={{ fontSize: 10, color: "var(--bad)" }}>Title is required</div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email List *</label>
                <textarea
                  ref={emailTextareaRef}
                  placeholder={"Paste emails here (one per line or comma separated)\ne.g. john@example.com, jane@test.com"}
                  value={newListEmails}
                  onChange={(e) => { setNewListEmails(e.target.value); setCreateError(""); }}
                  style={{ ...inputStyle, minHeight: 100, resize: "vertical", fontFamily: "monospace", lineHeight: 1.5, fontSize: 12, borderColor: createError && validEmails.length === 0 ? "var(--bad)" : invalidEmails.length > 0 ? "var(--warn)" : undefined }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {validEmails.length > 0 && (
                    <span style={{ fontSize: 10, color: "var(--good)" }}>{validEmails.length} valid</span>
                  )}
                  {invalidEmails.length > 0 && (
                    <span style={{ fontSize: 10, color: "var(--bad)" }}>{invalidEmails.length} invalid</span>
                  )}
                  {newListEmails.trim() === "" && (
                    <span style={{ fontSize: 10, color: "var(--text2)" }}>Enter one email per line or separated by commas</span>
                  )}
                </div>
                {invalidEmails.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {invalidEmails.map((email, i) => (
                      <span
                        key={i}
                        onClick={(e) => { e.stopPropagation(); jumpToInvalidEmail(email); }}
                        style={{ fontSize: 10, color: "var(--bad)", background: "rgba(255,71,71,0.1)", padding: "2px 6px", borderRadius: 4, cursor: "pointer", transition: "background 0.1s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,71,71,0.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,71,71,0.1)")}
                      >
                        {email}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--stroke0)" }}>
              <button className="pillBtn" onClick={resetCreateForm} type="button" style={{ fontSize: 12 }}>Cancel</button>
              <button
                className="pillBtn"
                onClick={handleCreateList}
                type="button"
                style={{ fontSize: 12 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>save</span>
                Save List
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
