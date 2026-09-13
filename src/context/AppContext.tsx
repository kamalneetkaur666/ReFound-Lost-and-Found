import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import {
  ItemReport,
  PotentialMatch,
  Claim,
  NotificationItem,
  UserProfile,
  ItemType,
  ItemCategory,
  ItemStatus,
} from '../types.ts';
import {
  db,
  auth,
  signInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  resetUserPassword,
  logOut,
  testConnection,
  formatAuthError,
} from '../firebase/config.ts';
import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  SAMPLE_ITEMS,
  SAMPLE_MATCHES,
  SAMPLE_CLAIMS,
  SAMPLE_NOTIFICATIONS,
} from '../data/sampleData.ts';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
  itemId?: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  firebaseUser: User | null;
  items: ItemReport[];
  matches: PotentialMatch[];
  claims: Claim[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  loading: boolean;
  isAiMatching: boolean;
  activeToast: ToastMessage | null;
  dismissToast: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  setDemoUser: (role: 'student' | 'staff' | 'finder') => void;
  addItemReport: (report: Omit<ItemReport, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'ownerName'>) => Promise<ItemReport>;
  updateItemReport: (id: string, updates: Partial<ItemReport>) => Promise<void>;
  deleteItemReport: (id: string) => Promise<void>;
  runAiMatchingForItem: (item: ItemReport) => Promise<PotentialMatch[]>;
  submitClaim: (itemId: string, answers: string, linkedLostItemId?: string) => Promise<Claim>;
  reviewClaim: (claimId: string, status: 'accepted' | 'rejected' | 'returned', reviewNote?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  flagListing: (itemId: string, reason: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    uid: 'demo-user-1',
    displayName: 'Alex Morgan',
    email: 'alex.m@campus.edu',
    campusId: 'STU-99412',
    department: 'Computer Science',
    phone: '(555) 321-7890',
  });

  const [items, setItems] = useState<ItemReport[]>(SAMPLE_ITEMS);
  const [matches, setMatches] = useState<PotentialMatch[]>(SAMPLE_MATCHES);
  const [claims, setClaims] = useState<Claim[]>(SAMPLE_CLAIMS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAiMatching, setIsAiMatching] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

  const prevNotificationIds = useRef<Set<string>>(new Set(SAMPLE_NOTIFICATIONS.map(n => n.id)));

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Date.now();
    setActiveToast({ ...toast, id });
    setTimeout(() => {
      setActiveToast(current => (current?.id === id ? null : current));
    }, 6000);
  };

  const dismissToast = () => setActiveToast(null);

  // Initialize connection and auth listener
  useEffect(() => {
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      setFirebaseUser(user);
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Campus Student',
          email: user.email || 'student@campus.edu',
          photoURL: user.photoURL || undefined,
          campusId: 'CAMPUS-' + user.uid.substring(0, 6).toUpperCase(),
        });
      }
    });

    // Real-time Firestore listener for items
    let unsubscribeItems = () => {};
    try {
      const itemsCol = collection(db, 'items');
      unsubscribeItems = onSnapshot(
        itemsCol,
        snapshot => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ItemReport));
            // Merge with sample items if sample IDs are not present
            const sampleIds = new Set(SAMPLE_ITEMS.map(s => s.id));
            const liveIds = new Set(fetched.map(f => f.id));
            const remainingSamples = SAMPLE_ITEMS.filter(s => !liveIds.has(s.id));
            setItems([...fetched, ...remainingSamples]);
          } else {
            setItems(SAMPLE_ITEMS);
          }
          setLoading(false);
        },
        error => {
          console.warn('Firestore items listener error, continuing with local dataset:', error);
          setLoading(false);
        }
      );
    } catch (e) {
      console.warn('Could not attach Firestore items listener:', e);
      setLoading(false);
    }

    // Real-time Firestore listener for potential matches
    let unsubscribeMatches = () => {};
    try {
      const matchesCol = collection(db, 'potentialMatches');
      unsubscribeMatches = onSnapshot(
        matchesCol,
        snapshot => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PotentialMatch));
            const liveIds = new Set(fetched.map(f => f.id));
            const remainingSamples = SAMPLE_MATCHES.filter(s => !liveIds.has(s.id));
            setMatches([...fetched, ...remainingSamples]);
          }
        },
        err => console.warn('Matches listener note:', err)
      );
    } catch (e) {
      console.warn('Could not attach matches listener:', e);
    }

    // Real-time Firestore listener for claims
    let unsubscribeClaims = () => {};
    try {
      const claimsCol = collection(db, 'claims');
      unsubscribeClaims = onSnapshot(
        claimsCol,
        snapshot => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Claim));
            const liveIds = new Set(fetched.map(f => f.id));
            const remainingSamples = SAMPLE_CLAIMS.filter(s => !liveIds.has(s.id));
            setClaims([...fetched, ...remainingSamples]);
          }
        },
        err => console.warn('Claims listener note:', err)
      );
    } catch (e) {
      console.warn('Could not attach claims listener:', e);
    }

    return () => {
      unsubscribeAuth();
      unsubscribeItems();
      unsubscribeMatches();
      unsubscribeClaims();
    };
  }, []);

  // Real-time notifications listener for current user
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeNotifs = () => {};
    try {
      const notifsCol = collection(db, 'notifications');
      const userNotifQuery = query(notifsCol, where('userId', '==', currentUser.uid));
      
      unsubscribeNotifs = onSnapshot(
        userNotifQuery,
        snapshot => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as NotificationItem));
            
            // Check for newly arrived notifications to trigger live toast
            fetched.forEach(item => {
              if (!prevNotificationIds.current.has(item.id) && !item.read) {
                showToast({
                  title: item.title,
                  message: item.message,
                  type: item.type === 'claim' ? 'alert' : 'info',
                  itemId: item.relatedItemId,
                });
                prevNotificationIds.current.add(item.id);
              }
            });

            const liveIds = new Set(fetched.map(f => f.id));
            const userSamples = SAMPLE_NOTIFICATIONS.filter(
              s => s.userId === currentUser.uid && !liveIds.has(s.id)
            );
            setNotifications([...fetched, ...userSamples]);
          }
        },
        err => {
          console.warn('Firestore user notifications listener note:', err);
        }
      );
    } catch (e) {
      console.warn('Could not attach user notifications listener:', e);
    }

    return () => {
      unsubscribeNotifs();
    };
  }, [currentUser?.uid]);

  const loginWithGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        const profile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Campus Student',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          campusId: 'CAMPUS-' + user.uid.substring(0, 6).toUpperCase(),
        };
        setCurrentUser(profile);
        showToast({
          title: 'Signed in with Google',
          message: `Welcome back, ${profile.displayName}!`,
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Login with Google error:', err);
      throw new Error(formatAuthError(err));
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const user = await fbSignInWithEmail(email, pass);
      const profile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || email.split('@')[0],
        email: user.email || email,
        campusId: 'CAMPUS-' + user.uid.substring(0, 6).toUpperCase(),
      };
      setCurrentUser(profile);
      showToast({
        title: 'Signed in successfully',
        message: `Logged in as ${profile.displayName}`,
        type: 'success',
      });
    } catch (err) {
      console.error('Login with email error:', err);
      throw new Error(formatAuthError(err));
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const user = await fbSignUpWithEmail(email, pass, name);
      const profile: UserProfile = {
        uid: user.uid,
        displayName: name.trim() || user.displayName || email.split('@')[0],
        email: user.email || email,
        campusId: 'CAMPUS-' + user.uid.substring(0, 6).toUpperCase(),
      };
      setCurrentUser(profile);
      showToast({
        title: 'Account created!',
        message: `Welcome to ReFound, ${profile.displayName}!`,
        type: 'success',
      });
    } catch (err) {
      console.error('Sign up with email error:', err);
      throw new Error(formatAuthError(err));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await resetUserPassword(email);
      showToast({
        title: 'Password reset email sent',
        message: `Instructions have been sent to ${email}`,
        type: 'info',
      });
    } catch (err) {
      console.error('Reset password error:', err);
      throw new Error(formatAuthError(err));
    }
  };

  const logoutUser = async () => {
    await logOut();
    setCurrentUser(null);
    setFirebaseUser(null);
    showToast({
      title: 'Signed Out',
      message: 'You have been signed out of ReFound.',
      type: 'info',
    });
  };

  // Demo user switcher for rapid evaluation
  const setDemoUser = (role: 'student' | 'staff' | 'finder') => {
    if (role === 'student') {
      setCurrentUser({
        uid: 'demo-user-1',
        displayName: 'Alex Morgan',
        email: 'alex.m@campus.edu',
        campusId: 'STU-99412',
        department: 'Computer Science & Engineering',
        phone: '(555) 321-7890',
      });
    } else if (role === 'staff') {
      setCurrentUser({
        uid: 'demo-staff-1',
        displayName: 'Jordan Lee (Library Staff)',
        email: 'jordan.lee@campus.edu',
        campusId: 'STAFF-1049',
        department: 'Main University Library',
        phone: '(555) 888-2341',
      });
    } else {
      setCurrentUser({
        uid: 'demo-user-7',
        displayName: 'Maya Patel',
        email: 'mpatel@campus.edu',
        campusId: 'STU-65231',
        department: 'Bioengineering',
        phone: '(555) 777-9012',
      });
    }
  };

  // Add Item Report
  const addItemReport = async (
    data: Omit<ItemReport, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'ownerName'>
  ): Promise<ItemReport> => {
    const id = 'item-' + Date.now();
    const now = new Date().toISOString();
    const ownerId = currentUser?.uid || 'guest-student';
    const ownerName = currentUser?.displayName || 'Campus Student';
    const ownerEmail = currentUser?.email || 'student@campus.edu';

    const newReport: ItemReport = {
      ...data,
      id,
      ownerId,
      ownerName,
      ownerEmail,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    // Update local state immediately
    setItems(prev => [newReport, ...prev]);

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'items', id), newReport);
    } catch (err) {
      console.warn('Could not persist to Firestore directly, saved in local state:', err);
    }

    // Automatically trigger background AI matching against opposing item pool
    runAiMatchingForItem(newReport).catch(e => console.warn('Background AI match note:', e));

    return newReport;
  };

  // Update Item Report
  const updateItemReport = async (id: string, updates: Partial<ItemReport>) => {
    const now = new Date().toISOString();
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates, updatedAt: now } : item)));

    try {
      const itemRef = doc(db, 'items', id);
      await updateDoc(itemRef, { ...updates, updatedAt: now });
    } catch (err) {
      console.warn('Firestore update note:', err);
    }
  };

  // Delete Item Report
  const deleteItemReport = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setMatches(prev => prev.filter(m => m.lostItemId !== id && m.foundItemId !== id));

    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (err) {
      console.warn('Firestore delete note:', err);
    }
  };

  // Run AI matching for an item
  const runAiMatchingForItem = async (item: ItemReport): Promise<PotentialMatch[]> => {
    setIsAiMatching(true);
    try {
      // Find candidate reports of the opposite type
      const targetOppositeType: ItemType = item.type === 'lost' ? 'found' : 'lost';
      const candidates = items
        .filter(c => c.type === targetOppositeType && c.id !== item.id && c.status !== 'returned' && c.status !== 'closed')
        .map(c => ({
          id: c.id,
          type: c.type,
          title: c.title,
          category: c.category,
          description: c.description,
          location: c.location,
          date: c.date,
          time: c.time,
        }));

      if (candidates.length === 0) {
        setIsAiMatching(false);
        return [];
      }

      const response = await fetch('/api/match-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceItem: {
            id: item.id,
            type: item.type,
            title: item.title,
            category: item.category,
            description: item.description,
            location: item.location,
            date: item.date,
            time: item.time,
          },
          candidates,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawMatches: Array<{
        candidateId: string;
        score: number;
        confidence: 'high' | 'medium' | 'low';
        explanation: string;
        matchingFactors: string[];
      }> = data.matches || [];

      const newPotentialMatches: PotentialMatch[] = rawMatches.map(m => {
        const lostId = item.type === 'lost' ? item.id : m.candidateId;
        const foundId = item.type === 'found' ? item.id : m.candidateId;
        return {
          id: 'match-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          lostItemId: lostId,
          foundItemId: foundId,
          score: m.score,
          confidence: m.confidence,
          explanation: m.explanation,
          matchingFactors: m.matchingFactors,
          status: 'suggested',
          suggestedBy: 'ai',
          createdAt: new Date().toISOString(),
        };
      });

      if (newPotentialMatches.length > 0) {
        setMatches(prev => {
          const filtered = prev.filter(
            p => !newPotentialMatches.some(n => n.lostItemId === p.lostItemId && n.foundItemId === p.foundItemId)
          );
          return [...newPotentialMatches, ...filtered];
        });

        // Persist matches to Firestore
        for (const m of newPotentialMatches) {
          try {
            await setDoc(doc(db, 'potentialMatches', m.id), m);
          } catch (e) {
            console.warn('Firestore match write note:', e);
          }
        }

        // Update item statuses to potential_match if currently active
        if (item.status === 'active') {
          updateItemReport(item.id, { status: 'potential_match' });
        }
        for (const m of newPotentialMatches) {
          const matchedTargetId = item.type === 'lost' ? m.foundItemId : m.lostItemId;
          const targetObj = items.find(i => i.id === matchedTargetId);
          if (targetObj && targetObj.status === 'active') {
            updateItemReport(matchedTargetId, { status: 'potential_match' });
          }
        }

        // Add a notification for the current user
        if (currentUser) {
          const notifId = 'notif-' + Date.now();
          const newNotif: NotificationItem = {
            id: notifId,
            userId: currentUser.uid,
            title: `Potential Match Detected!`,
            message: `Gemini found ${newPotentialMatches.length} potential matching item(s) for "${item.title}".`,
            type: 'match',
            relatedItemId: item.id,
            read: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications(prev => [newNotif, ...prev]);
          try {
            await setDoc(doc(db, 'notifications', notifId), newNotif);
          } catch (e) {
            console.warn('Match notif write note:', e);
          }
        }
      }

      setIsAiMatching(false);
      return newPotentialMatches;
    } catch (err) {
      console.error('Error during AI matching:', err);
      setIsAiMatching(false);
      return [];
    }
  };

  // Submit Claim (Verification flow)
  // Ensures that when a claim is submitted on a found item:
  // 1. The reporter of the found item (finder) is notified
  // 2. The user(s) who reported a matching lost item are NOTIFIED with updates!
  // 3. The claimant gets a confirmation notification
  const submitClaim = async (
    itemId: string,
    identifyingAnswers: string,
    linkedLostItemId?: string
  ): Promise<Claim> => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) throw new Error('Item not found');

    const claimId = 'claim-' + Date.now();
    const now = new Date().toISOString();
    const claimantId = currentUser?.uid || 'guest-claimant';
    const claimantName = currentUser?.displayName || 'Claimant Student';
    const claimantEmail = currentUser?.email || 'claimant@campus.edu';

    const newClaim: Claim = {
      id: claimId,
      itemId: targetItem.id,
      itemTitle: targetItem.title,
      itemType: targetItem.type,
      claimantId,
      claimantName,
      claimantEmail,
      reporterId: targetItem.ownerId,
      identifyingAnswers: linkedLostItemId
        ? `${identifyingAnswers}\n[Linked Lost Report: ${linkedLostItemId}]`
        : identifyingAnswers,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    setClaims(prev => [newClaim, ...prev]);

    const notificationsToDispatch: NotificationItem[] = [];

    if (targetItem.type === 'found') {
      // 1. Send notification to the finder who posted the found report
      notificationsToDispatch.push({
        id: 'notif-' + Date.now() + '-finder',
        userId: targetItem.ownerId,
        title: 'New Ownership Claim Submitted',
        message: `${claimantName} submitted a verification claim for your found item "${targetItem.title}". Review their identifying details.`,
        type: 'claim',
        relatedItemId: targetItem.id,
        read: false,
        createdAt: now,
      });

      // 2. Identify the user(s) who lost this item and notify them!
      // Check explicit linked lost report, AI matches, and lost items in the same category
      const matchedLostItemIds = new Set<string>();
      if (linkedLostItemId) {
        matchedLostItemIds.add(linkedLostItemId);
      }

      // Check all matches where this item was the foundItemId
      matches
        .filter(m => m.foundItemId === targetItem.id)
        .forEach(m => matchedLostItemIds.add(m.lostItemId));

      // Also check if any lost items match title/category closely
      items
        .filter(
          i =>
            i.type === 'lost' &&
            i.category === targetItem.category &&
            i.status !== 'returned' &&
            i.status !== 'closed'
        )
        .forEach(i => matchedLostItemIds.add(i.id));

      matchedLostItemIds.forEach(lostId => {
        const lostReport = items.find(i => i.id === lostId);
        if (!lostReport) return;

        // If the claimant is the one who lost it:
        if (lostReport.ownerId === claimantId) {
          notificationsToDispatch.push({
            id: 'notif-' + Date.now() + '-claimant-confirm',
            userId: claimantId,
            title: 'Claim Submitted: Verification Pending',
            message: `Your ownership claim for found item "${targetItem.title}" has been submitted to the finder (${targetItem.ownerName}). You can track review progress in My Reports.`,
            type: 'claim',
            relatedItemId: targetItem.id,
            read: false,
            createdAt: now,
          });

          // Link lost item status to potential_match / claimed
          updateItemReport(lostReport.id, { status: 'potential_match' });
        } else if (lostReport.ownerId !== targetItem.ownerId) {
          // A DIFFERENT user who lost this item gets notified that someone submitted a claim on the matching found item!
          notificationsToDispatch.push({
            id: 'notif-' + Date.now() + '-lost-owner-' + lostReport.id,
            userId: lostReport.ownerId,
            title: 'Claim Alert on Matching Found Item',
            message: `Another student submitted an ownership claim for found item "${targetItem.title}" (matching your lost report "${lostReport.title}"). If this item is yours, please review the listing or submit your verification details.`,
            type: 'claim',
            relatedItemId: targetItem.id,
            read: false,
            createdAt: now,
          });
        }
      });

      // If the claimant was not one of the matched lost item owners, still send confirmation
      const alreadyConfirmed = notificationsToDispatch.some(n => n.userId === claimantId);
      if (!alreadyConfirmed) {
        notificationsToDispatch.push({
          id: 'notif-' + Date.now() + '-claimant-receipt',
          userId: claimantId,
          title: 'Claim Submitted Successfully',
          message: `Your ownership claim for "${targetItem.title}" was submitted to ${targetItem.ownerName}. You will be notified when it is reviewed.`,
          type: 'claim',
          relatedItemId: targetItem.id,
          read: false,
          createdAt: now,
        });
      }
    } else {
      // The item being claimed is a 'lost' item (i.e. someone clicked "I Found This Item!")
      // The owner of the lost item receives the notification!
      notificationsToDispatch.push({
        id: 'notif-' + Date.now() + '-lost-owner-found',
        userId: targetItem.ownerId,
        title: 'Someone Found Your Item!',
        message: `${claimantName} has reported finding your lost "${targetItem.title}"! Review their details to coordinate a campus return.`,
        type: 'claim',
        relatedItemId: targetItem.id,
        read: false,
        createdAt: now,
      });

      notificationsToDispatch.push({
        id: 'notif-' + Date.now() + '-finder-receipt',
        userId: claimantId,
        title: 'Finder Message Sent',
        message: `The student who lost "${targetItem.title}" has been notified. They will review your note to coordinate handover.`,
        type: 'claim',
        relatedItemId: targetItem.id,
        read: false,
        createdAt: now,
      });
    }

    // Update local notifications
    setNotifications(prev => [...notificationsToDispatch, ...prev]);

    // Persist claim and notifications to Firestore
    try {
      await setDoc(doc(db, 'claims', claimId), newClaim);
      for (const notif of notificationsToDispatch) {
        await setDoc(doc(db, 'notifications', notif.id), notif);
      }
    } catch (err) {
      console.warn('Firestore claim persistence note:', err);
    }

    showToast({
      title: 'Claim Submitted',
      message: `Your verification details for "${targetItem.title}" have been submitted.`,
      type: 'success',
      itemId: targetItem.id,
    });

    return newClaim;
  };

  // Review Claim (Reporter accepts, rejects, or marks returned)
  const reviewClaim = async (claimId: string, status: 'accepted' | 'rejected' | 'returned', reviewNote?: string) => {
    const now = new Date().toISOString();
    const targetClaim = claims.find(c => c.id === claimId);
    if (!targetClaim) return;

    setClaims(prev =>
      prev.map(c => (c.id === claimId ? { ...c, status, reviewNote: reviewNote || c.reviewNote, updatedAt: now } : c))
    );

    const targetItem = items.find(i => i.id === targetClaim.itemId);

    // Update item status accordingly
    if (status === 'accepted') {
      updateItemReport(targetClaim.itemId, { status: 'claimed' });
    } else if (status === 'returned') {
      updateItemReport(targetClaim.itemId, { status: 'returned' });
    }

    const notificationsToDispatch: NotificationItem[] = [];

    // 1. Notify the claimant about the review outcome
    notificationsToDispatch.push({
      id: 'notif-' + Date.now() + '-claim-outcome',
      userId: targetClaim.claimantId,
      title:
        status === 'accepted'
          ? 'Claim Accepted! Contact Revealed'
          : status === 'returned'
          ? 'Item Marked as Returned'
          : 'Claim Update: Verification Rejected',
      message:
        status === 'accepted'
          ? `Your claim for "${targetClaim.itemTitle}" was accepted. You can now coordinate pickup.`
          : status === 'returned'
          ? `The item "${targetClaim.itemTitle}" has been confirmed returned. Thank you!`
          : `Your claim for "${targetClaim.itemTitle}" was declined by the reporter.${reviewNote ? ` Note: "${reviewNote}"` : ''}`,
      type: 'claim_update',
      relatedItemId: targetClaim.itemId,
      read: false,
      createdAt: now,
    });

    // 2. Notify any other users who had a matching lost item report!
    if (targetItem) {
      const matchedLostItemIds = new Set<string>();
      matches
        .filter(m => m.foundItemId === targetItem.id)
        .forEach(m => matchedLostItemIds.add(m.lostItemId));

      items
        .filter(
          i =>
            i.type === 'lost' &&
            i.category === targetItem.category &&
            i.id !== targetClaim.itemId &&
            i.status !== 'returned' &&
            i.status !== 'closed'
        )
        .forEach(i => matchedLostItemIds.add(i.id));

      matchedLostItemIds.forEach(lostId => {
        const lostReport = items.find(i => i.id === lostId);
        if (!lostReport) return;

        if (lostReport.ownerId === targetClaim.claimantId) {
          // If claimant had this lost report, update its status
          if (status === 'accepted' || status === 'returned') {
            updateItemReport(lostReport.id, { status: status === 'returned' ? 'returned' : 'claimed' });
          }
        } else if (lostReport.ownerId !== targetClaim.reporterId) {
          // Other user who lost an item gets updated on the status change of the found item
          notificationsToDispatch.push({
            id: 'notif-' + Date.now() + '-lost-outcome-' + lostReport.id,
            userId: lostReport.ownerId,
            title:
              status === 'accepted' || status === 'returned'
                ? 'Matched Item Has Been Claimed'
                : 'Matched Found Item Still Available',
            message:
              status === 'accepted' || status === 'returned'
                ? `The found item "${targetItem.title}" matching your lost report "${lostReport.title}" was claimed by another student. If you believe this was in error, please contact campus lost & found.`
                : `A previous claim on found item "${targetItem.title}" was declined. The item is still available to claim if it belongs to you.`,
            type: 'status_update',
            relatedItemId: targetItem.id,
            read: false,
            createdAt: now,
          });
        }
      });
    }

    setNotifications(prev => [...notificationsToDispatch, ...prev]);

    try {
      await updateDoc(doc(db, 'claims', claimId), { status, reviewNote: reviewNote || '', updatedAt: now });
      for (const notif of notificationsToDispatch) {
        await setDoc(doc(db, 'notifications', notif.id), notif);
      }
    } catch (err) {
      console.warn('Firestore review note:', err);
    }

    showToast({
      title: status === 'accepted' ? 'Claim Accepted' : status === 'returned' ? 'Item Marked Returned' : 'Claim Declined',
      message: `The claim for "${targetClaim.itemTitle}" has been updated.`,
      type: status === 'rejected' ? 'alert' : 'success',
    });
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      // silent
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (currentUser) {
      for (const notif of notifications) {
        if (!notif.read && notif.userId === currentUser.uid) {
          try {
            await updateDoc(doc(db, 'notifications', notif.id), { read: true });
          } catch (e) {
            // silent
          }
        }
      }
    }
  };

  const flagListing = async (itemId: string, reason: string) => {
    const flagId = 'flag-' + Date.now();
    const reporterId = currentUser?.uid || 'anonymous';
    try {
      await setDoc(doc(db, 'listingFlags', flagId), {
        id: flagId,
        itemId,
        reporterId,
        reason,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Flag note:', e);
    }
    setItems(prev => prev.map(i => (i.id === itemId ? { ...i, flaggedCount: (i.flaggedCount || 0) + 1 } : i)));
    showToast({
      title: 'Report Flagged',
      message: 'Thank you for keeping our campus lost & found safe.',
      type: 'info',
    });
  };

  const unreadNotificationCount = notifications.filter(
    n => (!currentUser || n.userId === currentUser.uid) && !n.read
  ).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseUser,
        items,
        matches,
        claims,
        notifications: currentUser ? notifications.filter(n => n.userId === currentUser.uid) : notifications,
        unreadNotificationCount,
        loading,
        isAiMatching,
        activeToast,
        dismissToast,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        resetPassword,
        logoutUser,
        setDemoUser,
        addItemReport,
        updateItemReport,
        deleteItemReport,
        runAiMatchingForItem,
        submitClaim,
        reviewClaim,
        markNotificationRead,
        markAllNotificationsRead,
        flagListing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

