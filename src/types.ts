export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'Electronics'
  | 'IDs & Cards'
  | 'Keys'
  | 'Bags & Backpacks'
  | 'Clothing & Apparel'
  | 'Books & Stationery'
  | 'Personal Accessories'
  | 'Other';

export type ItemStatus = 'active' | 'potential_match' | 'claimed' | 'returned' | 'closed';

export interface ItemReport {
  id: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  description: string;
  location: string;
  date: string;
  time?: string;
  imageUrl: string;
  status: ItemStatus;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  privateDetails?: string;
  holdingLocation?: string;
  flaggedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PotentialMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  matchingFactors: string[];
  status: 'suggested' | 'confirmed_by_user' | 'dismissed';
  suggestedBy: 'ai' | 'user';
  createdAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: ItemType;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  claimantDepartment?: string;
  claimantCampusId?: string;
  reporterId: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  reporterDepartment?: string;
  reporterCampusId?: string;
  identifyingAnswers: string;
  status: 'pending' | 'accepted' | 'rejected' | 'returned';
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'claim' | 'claim_update' | 'status_update';
  relatedItemId?: string;
  relatedClaimId?: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderDepartment?: string;
  senderCampusId?: string;
  claimAnswers?: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  campusId?: string;
  department?: string;
  phone?: string;
  photoURL?: string;
}
