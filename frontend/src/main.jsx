import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './index.css';

console.log('DROGUERIEPRO V51 OK');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Le jeton de session (V48) est envoyé à chaque requête : la base vérifie qui agit (RLS).
function sessionToken() {
  try { return JSON.parse(localStorage.getItem('droguerie_session') || 'null')?.token || null; } catch { return null; }
}

const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseKey || 'missing-key',
  {
    global: {
      fetch: (input, init = {}) => {
        const headers = new Headers(init.headers || {});
        const tok = sessionToken();
        if (tok) headers.set('x-app-token', tok);
        return fetch(input, { ...init, headers });
      }
    }
  }
);

// Mode sécurisé disponible ? (script MAJ_V48 exécuté) — sinon l'app garde l'ancien fonctionnement
let secureBackendCache = null;
function isMissingFunctionError(error) {
  return !!error && (error.code === 'PGRST202' || error.code === '42883' || /could not find the function/i.test(error.message || ''));
}
async function isSecureBackend() {
  if (secureBackendCache !== null) return secureBackendCache;
  try {
    const { data, error } = await supabase.rpc('app_security_version');
    if (error) { if (isMissingFunctionError(error)) secureBackendCache = false; return false; }
    secureBackendCache = Number(data || 0) >= 48;
  } catch { return false; }
  return secureBackendCache;
}
function rpcError(error) {
  const msg = error?.message || 'Erreur serveur';
  if (error?.code === '28000' && /session/i.test(msg)) { try { localStorage.removeItem('droguerie_session'); } catch {} }
  return new Error(msg);
}

const today = () => new Date().toISOString().slice(0, 10);
const fmt = n => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dh = n => fmt(n) + ' DH';

const TXT = {
  fr: {
    login: 'Connexion', username: 'Utilisateur', password: 'Mot de passe', connect: 'Se connecter',
    dashboard: 'Tableau de bord', products: 'Produits / Stock', sales: 'Ventes', purchases: 'Achats',
    payments: 'Paiements', stockMoves: 'Mouvements stock', audit: 'Traçabilité', settings: 'Paramètres', permissions: 'Autorisations', clients: 'Clients', suppliers: 'Fournisseurs', users: 'Utilisateurs', branch: 'Droguerie', branches: 'Gestion drogueries', city: 'Ville', manager: 'Responsable', active: 'Actif', deactivate: 'Désactiver', activate: 'Activer', fullName: 'Nom complet', changePassword: 'Changer mot de passe',
    logout: 'Déconnexion', lang: 'العربية', new: 'Nouveau', save: 'Enregistrer', edit: 'Modifier',
    del: 'Supprimer', actions: 'Actions', stock: 'Stock', price: 'Prix', create: 'Créer',
    direct: 'Direct', advance: 'Avancer', pay: 'Régler', partialDelivery: 'Livraison partielle',
    partialReceipt: 'Réception partielle', all: 'Tous', quotes: 'Devis', orders: 'Commandes',
    deliveries: 'Livraisons', receipts: 'Réceptions', invoices: 'Factures', remaining: 'Reste',
    paid: 'Réglée', unpaid: 'Non réglée', partial: 'Partielle', cashIn: 'Encaissements',
    cashOut: 'Décaissements', vat: 'TVA', theme: 'Thème', company: 'Société', address: 'Adresse', phone: 'Téléphone', ice: 'ICE', cashRegister: 'Caisse', receiptNo: 'N° reçu', chequeNo: 'N° chèque', bank: 'Banque', dueDate: 'Échéance', paymentStatus: 'Statut', transferRef: 'Réf. virement', valueDate: 'Date valeur', terminal: 'TPE', transactionNo: 'N° transaction', billNo: 'N° effet', note: 'Observation', quantity: 'Quantité', date: 'Date', customer: 'Client',
    supplier: 'Fournisseur', product: 'Produit', base: 'Base', remainingQty: 'Qté restante', orderedQty: 'Qté commandée', deliveredQty: 'Qté livrée', receivedQty: 'Qté reçue', qtyToProcess: 'Qté à traiter', alreadyProcessed: 'Déjà traité', includeLine: 'Inclure', removeLine: 'Retirer ligne', restoreLine: 'Restaurer ligne', open: 'Ouvert', closed: 'Clôturé', preview: 'Aperçu', print: 'Imprimer', unitPrice: 'PU', totalHT: 'Total HT', totalVAT: 'TVA', totalTTC: 'Total TTC', cancelPayment: 'Annuler règlement', canceled: 'Annulé', subtotal: 'Sous-total', signature: 'Signature', preparedBy: 'Préparé par', printDate: 'Date impression', legalNote: 'Document généré par DrogueriePro', arabicName: 'Nom arabe', docType: 'Type document', purchasePrice: 'Prix achat', salePrice: 'Prix vente', margin: 'Marge', movement: 'Mouvement', object: 'Objet', detail: 'Détail', actor: 'Utilisateur', createdBy: 'Créé par', baseDocNo: 'N° doc. base', location: 'Emplacement', assignedTo: 'Affecté à', clientOwner: 'Compte', stockTransfer: 'Transfert stock', fromBranch: 'Droguerie source', toBranch: 'Droguerie destination', stockValue: 'Valeur stock', lowStock: 'Stock critique', stockByBranch: 'Stock par droguerie', adjustment: 'Ajustement', stockIn: 'Entrée stock', stockOut: 'Sortie stock', reason: 'Motif', category: 'Catégorie', ref: 'Référence', name: 'Nom', role: 'Profil', payment: 'Paiement', document: 'Document', form: 'Formulaire', select: 'Sélectionner', productRef: 'Réf. produit', unit: 'Unité', minStock: 'Stock min', threshold: 'Seuil', stockAdjustIn: 'Entrée stock', stockAdjustOut: 'Sortie stock', operationType: 'Type opération', unitPurchasePrice: 'Prix achat unitaire', unitSalePrice: 'Prix vente unitaire', customerForm: 'Fiche client', supplierForm: 'Fiche fournisseur', productForm: 'Fiche produit', documentLines: 'Lignes document', completed: 'Terminé', notAvailable: 'Non applicable', mobileApp: 'Application mobile', androidApp: 'Application Android', iosApp: 'Application iOS', downloadAndroid: 'Télécharger APK Android', downloadIos: 'Télécharger iOS', installGuide: 'Guide installation', mobileAdminPortal: 'Portail mobile administrateur', appStoreNote: 'iOS nécessite App Store / TestFlight avec compte Apple Developer', androidNote: 'Android peut être installé via APK interne ou publié sur Play Store', quickActions: 'Actions rapides', businessHealth: 'Santé activité', alerts: 'Alertes', recentActivity: 'Activité récente', topProducts: 'Top produits', todaySales: 'Ventes du jour', unpaidInvoices: 'Factures non réglées', stockAlerts: 'Alertes stock', customersCount: 'Nombre clients', suppliersCount: 'Nombre fournisseurs', adminCenter: 'Centre administrateur', proMode: 'Mode Pro', search: 'Rechercher', exportCsv: 'Exporter CSV', printList: 'Imprimer liste', risk: 'Risque', healthy: 'Sain', warning: 'Attention', critical: 'Critique', noData: 'Aucune donnée', performance: 'Performance', customerInvoice: 'Facture client', supplierInvoice: 'Facture fournisseur', customerQuote: 'Devis client', customerOrder: 'Commande client', customerDelivery: 'Bon de livraison client', supplierOrder: 'Commande fournisseur', supplierReceipt: 'Bon de réception fournisseur', profitCenter: 'Centre rentabilité', profitability: 'Rentabilité', profitAlerts: 'Alertes rentabilité', priceSuggestion: 'Suggestion prix', minimumSalePrice: 'Prix minimum conseillé', targetMargin: 'Marge cible', marginRate: 'Taux marge', reorderProposal: 'Proposition réapprovisionnement', reorderQty: 'Qté à commander', deadStock: 'Stock dormant', fastMoving: 'Rotation rapide', slowMoving: 'Rotation lente', valuation: 'Valorisation', commercialTerms: 'Conditions commerciales', preparedFor: 'Établi pour', documentValidity: 'Validité document', deliveryAddress: 'Adresse livraison', tools: 'Outils', calculator: 'Calculatrice', marginCalculator: 'Calcul marge', salePriceFromMargin: 'Prix selon marge', purchaseCost: 'Coût achat', wantedMargin: 'Marge souhaitée', result: 'Résultat', clear: 'Effacer', simplePrint: 'Impression simple', kpiRevenue: 'Chiffre d’affaires', kpiPurchases: 'Volume achats', kpiCashIn: 'Total encaissé', kpiCashOut: 'Total décaissé', kpiStockQty: 'Quantité stock', kpiOpenDocs: 'Documents ouverts', kpiPaidRate: 'Taux factures réglées', kpiLowMargin: 'Produits faible marge', paymentList: 'Liste paiements', superAdmin: 'SuperAdmin', saasCenter: 'Centre SaaS', modulesCenter: 'Gestion modules', databaseCenter: 'Base de données', subscription: 'Abonnement', plan: 'Plan', enabled: 'Activé', disabled: 'Désactivé', moduleCode: 'Code module', moduleName: 'Nom module', modulePrice: 'Prix module', commercialPack: 'Pack commercial', tenant: 'Client / Tenant', tenants: 'Clients / Tenants', databaseStats: 'Statistiques base', tableName: 'Table', recordsCount: 'Enregistrements', fixStockTransfer: 'Correction transfert stock', moduleBilling: 'Facturation modules', monthlyPrice: 'Prix mensuel', yearlyPrice: 'Prix annuel', branchFilter: 'Filtre droguerie', allBranches: 'Toutes drogueries', applyFilter: 'Appliquer filtre', filteredByBranch: 'Filtré par droguerie', userFilter: 'Filtre utilisateur', allUsers: 'Tous utilisateurs', salesBySeller: 'CA par vendeur', debtBySeller: 'Dette par vendeur', salesPerformance: 'Performance commerciale', collectionReport: 'Suivi recouvrement', marginBySeller: 'Marge par vendeur', unpaidBySeller: 'Impayés par vendeur', docsByUser: 'Documents par utilisateur', creator: 'Créateur', seller: 'Vendeur', turnover: 'Chiffre d’affaires', collected: 'Encaissé', outstanding: 'Encours', avgDelay: 'Délai moyen', reportSuggestions: 'Reportings proposés', backupCenter: 'Sauvegarde base', backupJson: 'Sauvegarde JSON', backupCsv: 'Sauvegarde CSV', backupSql: 'Script SQL', downloadBackup: 'Télécharger sauvegarde', exportAll: 'Exporter tout', localBackup: 'Backup local', backupDate: 'Date sauvegarde', backupTables: 'Tables sauvegardées', restoreNote: 'Restauration', databaseExport: 'Export base de données', fullBackup: 'Sauvegarde complète', reporting: 'Reporting', customerDebts: 'Dettes clients', supplierDebts: 'Dettes fournisseurs', totalDebt: 'Total dette', businessModules: 'Modules métier', platformModules: 'Modules plateforme', protectedProfile: 'Profil protégé', expiry: 'Péremption', expiryAlert: 'Péremption proche', expensesMod: 'Charges & Déplacements', trips: 'Déplacements', trip: 'Déplacement', expense: 'Charge', netMargin: 'Marge nette', grossMarginLbl: 'Marge brute', totalCharges: 'Total charges', chargeCat: 'Catégorie', beneficiary: 'Bénéficiaire', vehicle: 'Véhicule', destination: 'Destination', manager2: 'Responsable', tripLabel: 'Libellé', addExpense: 'Ajouter charge', addTrip: 'Nouveau déplacement', tripMargin: 'Marge du déplacement', statement: 'Relevé', balanceDue: 'Solde dû', totalInvoiced: 'Total facturé', totalPaid: 'Total réglé', amount: 'Montant', statusLbl: 'Statut', linkTo: 'Rattacher une vente', linkedSales: 'Ventes rattachées', tripDetail: 'Détail du déplacement', noTrip: 'Hors déplacement', charges: 'Charges', unlink: 'Détacher', chargeNum: 'N° charge', tripNum: 'N° déplacement', attach: 'Pièces jointes', addAttachment: 'Ajouter un fichier', noAttachment: 'Aucune pièce jointe', myActivity: 'Mon activité', myActivityAll: 'Activité (toutes drogueries)', dateFrom: 'Du', dateTo: 'Au', allPeriod: 'Toute la période', pmpHint: 'Calculé automatiquement : prix moyen pondéré des entrées en stock', qtyHint: 'Gérée par les achats, ventes et mouvements de stock', unitCost: 'Coût unitaire HT (optionnel)', unitCostHint: 'Sert au calcul du prix moyen pondéré (PMP)', partialInvoice: 'Facturation partielle', invoicedQty: 'Facturé', categoriesUnits: 'Catégories & unités', categories: 'Catégories', units: 'Unités', allCategories: 'Toutes catégories', listsNotReady: 'Listes par défaut affichées : exécutez le script SQL de mise à jour pour pouvoir les modifier.', alertsSettings: 'Gestion des alertes', alertsSettingsHint: 'Activez les alertes affichées sur le tableau de bord et les listes, et réglez leurs seuils.', alertStock: 'Alerte stock minimum', alertStockHint: 'Seuil défini sur chaque produit (stock min).', alertExpiry: 'Alerte péremption', alertExpiryDays: 'Délai avant péremption (jours)', alertUnpaid: 'Alerte factures impayées', alertUnpaidDays: 'Impayée depuis plus de (jours)', alertMargin: 'Alerte marge faible', alertMarginMin: 'Marge minimum (%)', expiringProducts: 'Péremption proche', overdueInvoices: 'Factures impayées en retard'
  },
  ar: {
    login: 'تسجيل الدخول', username: 'اسم المستخدم', password: 'كلمة المرور', connect: 'الدخول إلى النظام',
    dashboard: 'لوحة التحكم', products: 'المنتجات والمخزون', sales: 'المبيعات', purchases: 'المشتريات والتوريد',
    payments: 'المدفوعات', stockMoves: 'حركات المخزون', audit: 'سجل العمليات', settings: 'الإعدادات', permissions: 'الصلاحيات', clients: 'الزبناء', suppliers: 'الموردون', users: 'المستخدمون', branch: 'الفرع', branches: 'إدارة الفروع', city: 'المدينة', manager: 'المسؤول', active: 'نشط', deactivate: 'تعطيل الحساب', activate: 'تفعيل الحساب', fullName: 'الاسم الكامل', changePassword: 'تغيير كلمة المرور',
    logout: 'تسجيل الخروج', lang: 'Français', new: 'إضافة جديد', save: 'حفظ البيانات', edit: 'تعديل البيانات',
    del: 'حذف السجل', actions: 'العمليات', stock: 'المخزون', price: 'الثمن', create: 'إنشاء',
    direct: 'مباشر', advance: 'الانتقال للمرحلة التالية', pay: 'تسجيل دفعة', partialDelivery: 'تسليم جزئي',
    partialReceipt: 'استلام جزئي', all: 'الكل', quotes: 'عروض الأسعار', orders: 'الطلبات',
    deliveries: 'سندات التسليم', receipts: 'سندات الاستلام', invoices: 'الفواتير', remaining: 'المتبقي',
    paid: 'مدفوعة بالكامل', unpaid: 'غير مدفوعة', partial: 'مدفوعة جزئياً', cashIn: 'المقبوضات',
    cashOut: 'المدفوعات', vat: 'الضريبة على القيمة المضافة', theme: 'المظهر', company: 'الشركة', address: 'العنوان', phone: 'الهاتف', ice: 'المعرّف الموحد للمقاولة ICE', cashRegister: 'الصندوق', receiptNo: 'رقم الوصل', chequeNo: 'رقم الشيك', bank: 'البنك', dueDate: 'تاريخ الاستحقاق', paymentStatus: 'حالة الأداء', transferRef: 'مرجع التحويل البنكي', valueDate: 'تاريخ القيمة', terminal: 'جهاز الأداء الإلكتروني', transactionNo: 'رقم العملية', billNo: 'رقم الكمبيالة', note: 'ملاحظة', quantity: 'الكمية', date: 'التاريخ', customer: 'الزبون',
    supplier: 'المورد', product: 'المنتج', base: 'الوثيقة الأصلية', remainingQty: 'الكمية المتبقية', orderedQty: 'الكمية المطلوبة', deliveredQty: 'الكمية المسلمة', receivedQty: 'الكمية المستلمة', qtyToProcess: 'الكمية المراد معالجتها', alreadyProcessed: 'تمت معالجته سابقاً', includeLine: 'إدراج السطر', removeLine: 'استبعاد السطر', restoreLine: 'إرجاع السطر', open: 'مفتوح', closed: 'مغلق', preview: 'معاينة الوثيقة', print: 'طباعة', unitPrice: 'ثمن الوحدة', totalHT: 'المبلغ دون الضريبة', totalVAT: 'قيمة الضريبة', totalTTC: 'المبلغ الإجمالي مع الضريبة', cancelPayment: 'إلغاء الدفعة', canceled: 'ملغى', subtotal: 'المجموع الفرعي', signature: 'التوقيع والختم', preparedBy: 'أُعدت بواسطة', printDate: 'تاريخ الطباعة', legalNote: 'وثيقة صادرة عن نظام DrogueriePro', arabicName: 'الاسم بالعربية', docType: 'نوع الوثيقة', purchasePrice: 'ثمن الشراء', salePrice: 'ثمن البيع', margin: 'الهامش', movement: 'الحركة', object: 'الكيان', detail: 'التفاصيل', actor: 'الموظف', createdBy: 'تم الإنشاء بواسطة', baseDocNo: 'رقم الوثيقة الأصلية', location: 'الموقع / الفرع', assignedTo: 'مكلف به', clientOwner: 'الحساب التجاري', stockTransfer: 'تحويل المخزون', fromBranch: 'الفرع المصدر', toBranch: 'الفرع الوجهة', stockValue: 'القيمة المالية للمخزون', lowStock: 'مخزون منخفض', stockByBranch: 'المخزون حسب الفرع', adjustment: 'تعديل المخزون', stockIn: 'إضافة كمية للمخزون', stockOut: 'خصم كمية من المخزون', reason: 'السبب', category: 'الصنف', ref: 'المرجع', name: 'الاسم', role: 'الدور', payment: 'الأداء', document: 'الوثيقة', form: 'النموذج', select: 'اختيار', productRef: 'مرجع المنتج', unit: 'الوحدة', minStock: 'الحد الأدنى للمخزون', threshold: 'عتبة التنبيه', stockAdjustIn: 'إضافة للمخزون', stockAdjustOut: 'سحب من المخزون', operationType: 'نوع العملية', unitPurchasePrice: 'ثمن الشراء للوحدة', unitSalePrice: 'ثمن البيع للوحدة', customerForm: 'بطاقة الزبون', supplierForm: 'بطاقة المورد', productForm: 'بطاقة المنتج', documentLines: 'سطور الوثيقة', completed: 'منتهية', notAvailable: 'غير مطبق', mobileApp: 'تطبيق الهاتف', androidApp: 'تطبيق أندرويد', iosApp: 'تطبيق iOS', downloadAndroid: 'تحميل تطبيق أندرويد APK', downloadIos: 'تحميل تطبيق iOS', installGuide: 'دليل التثبيت', mobileAdminPortal: 'بوابة إدارة التطبيق المحمول', appStoreNote: 'يتطلب iOS النشر عبر App Store أو TestFlight وحساب Apple Developer', androidNote: 'يمكن تثبيت أندرويد عبر APK داخلي أو نشره على Play Store', quickActions: 'إجراءات سريعة', businessHealth: 'حالة النشاط التجاري', alerts: 'التنبيهات', recentActivity: 'آخر العمليات', topProducts: 'أفضل المنتجات', todaySales: 'إجمالي مبيعات اليوم', unpaidInvoices: 'الفواتير غير المحصلة', stockAlerts: 'تنبيهات نقص المخزون', customersCount: 'عدد الزبناء', suppliersCount: 'عدد الموردين', adminCenter: 'مركز الإدارة', proMode: 'الوضع الإداري', search: 'البحث', exportCsv: 'تصدير CSV', printList: 'طباعة اللائحة', risk: 'مخاطر', healthy: 'وضعية سليمة', warning: 'تحتاج للمتابعة', critical: 'حالة حرجة', noData: 'لا توجد بيانات', performance: 'الأداء', grossMargin: 'الهامش الخام', salesPipeline: 'مسار المبيعات', purchasePipeline: 'مسار المشتريات', cashPosition: 'وضعية السيولة', inventoryCoverage: 'تغطية المخزون', operationalRisks: 'المخاطر التشغيلية', branchRanking: 'ترتيب الفروع', monthlyTrend: 'التطور الشهري', conversionRate: 'نسبة التحويل', avgTicket: 'متوسط الفاتورة', documentsCount: 'عدد الوثائق', proReport: 'تقرير إداري', refresh: 'تحديث', executiveSummary: 'ملخص تنفيذي', salesToCollect: 'مبالغ في انتظار التحصيل', purchasesToPay: 'مبالغ في انتظار الأداء', netCash: 'الصافي المتوقع', bestBranch: 'أفضل فرع', quickCreateSale: 'إنشاء عملية بيع', quickCreatePurchase: 'إنشاء عملية شراء', quickCreateProduct: 'إضافة منتج', quickCreateClient: 'إضافة زبون', expiry: 'تاريخ الصلاحية', expiryAlert: 'قرب انتهاء الصلاحية', expensesMod: 'المصاريف والتنقلات', trips: 'التنقلات', trip: 'تنقل', expense: 'مصروف', netMargin: 'الهامش الصافي', grossMarginLbl: 'الهامش الخام', totalCharges: 'مجموع المصاريف', chargeCat: 'النوع', beneficiary: 'المستفيد', vehicle: 'المركبة', destination: 'الوجهة', manager2: 'المسؤول', tripLabel: 'التسمية', addExpense: 'إضافة مصروف', addTrip: 'تنقل جديد', tripMargin: 'هامش التنقل', statement: 'كشف الحساب', balanceDue: 'الرصيد المستحق', totalInvoiced: 'إجمالي الفوترة', totalPaid: 'إجمالي المؤدى', amount: 'المبلغ', statusLbl: 'الحالة', linkTo: 'ربط عملية بيع', linkedSales: 'المبيعات المرتبطة', tripDetail: 'تفاصيل التنقل', noTrip: 'بدون تنقل', charges: 'المصاريف', unlink: 'فصل', chargeNum: 'رقم المصروف', tripNum: 'رقم التنقل', attach: 'المرفقات', addAttachment: 'إضافة ملف', noAttachment: 'لا توجد مرفقات', myActivity: 'نشاطي', myActivityAll: 'النشاط (كل المحلات)', dateFrom: 'من', dateTo: 'إلى', allPeriod: 'كل الفترة', pmpHint: 'يُحسب تلقائياً: متوسط التكلفة المرجّح لمداخيل المخزون', qtyHint: 'تُدار عبر المشتريات والمبيعات وحركات المخزون', unitCost: 'تكلفة الوحدة دون رسوم (اختياري)', unitCostHint: 'تُستعمل لحساب متوسط التكلفة المرجّح', partialInvoice: 'فوترة جزئية', invoicedQty: 'مفوتر', categoriesUnits: 'الأصناف والوحدات', categories: 'الأصناف', units: 'الوحدات', allCategories: 'كل الأصناف', listsNotReady: 'لوائح افتراضية: نفّذ سكريبت SQL للتحديث لتتمكن من تعديلها.', alertsSettings: 'إدارة التنبيهات', alertsSettingsHint: 'فعّل التنبيهات المعروضة في لوحة القيادة واللوائح وحدّد عتباتها.', alertStock: 'تنبيه الحد الأدنى للمخزون', alertStockHint: 'العتبة محددة في كل منتج (الحد الأدنى).', alertExpiry: 'تنبيه الصلاحية', alertExpiryDays: 'المدة قبل انتهاء الصلاحية (أيام)', alertUnpaid: 'تنبيه الفواتير غير المؤداة', alertUnpaidDays: 'غير مؤداة منذ أكثر من (أيام)', alertMargin: 'تنبيه الهامش الضعيف', alertMarginMin: 'الهامش الأدنى (%)', expiringProducts: 'صلاحية قريبة الانتهاء', overdueInvoices: 'فواتير متأخرة الأداء',
    fiscalId: 'المعرّف الجبائي', rc: 'السجل التجاري', patente: 'رسم المهني', cnss: 'رقم CNSS', ifNumber: 'المعرّف الضريبي IF', companyInfo: 'معلومات الشركة', clientInfo: 'معلومات الزبون', supplierInfo: 'معلومات المورد', paymentTerms: 'شروط الأداء', legalMoroccoNote: 'وثيقة تجارية صادرة وفق المعطيات المصرح بها من طرف الشركة. يرجى مراجعة المبالغ والضريبة على القيمة المضافة قبل الاعتماد النهائي.', stampAndSignature: 'الختم والتوقيع', commercialDocument: 'وثيقة تجارية', invoiceTitle: 'فاتورة', deliveryTitle: 'سند تسليم', receiptTitle: 'سند استلام', quoteTitle: 'عرض سعر', orderTitle: 'طلبية', amountInWords: 'المبلغ بالحروف', taxSummary: 'ملخص الضريبة', netToPay: 'الصافي للأداء', thankYou: 'شكراً لتعاملكم معنا', generatedBy: 'تم إنشاء الوثيقة بواسطة', customerInvoice: 'فاتورة زبون', supplierInvoice: 'فاتورة مورد', customerQuote: 'عرض سعر للزبون', customerOrder: 'طلبية زبون', customerDelivery: 'سند تسليم للزبون', supplierOrder: 'طلبية مورد', supplierReceipt: 'سند استلام من المورد', profitCenter: 'مركز الربحية', profitability: 'الربحية', profitAlerts: 'تنبيهات الربحية', priceSuggestion: 'اقتراح الثمن', minimumSalePrice: 'أدنى ثمن بيع مقترح', targetMargin: 'الهامش المستهدف', marginRate: 'نسبة الهامش', reorderProposal: 'اقتراح إعادة التزويد', reorderQty: 'الكمية المقترحة للطلب', deadStock: 'مخزون راكد', fastMoving: 'دوران سريع', slowMoving: 'دوران بطيء', valuation: 'التقييم المالي', commercialTerms: 'الشروط التجارية', preparedFor: 'موجه إلى', documentValidity: 'صلاحية الوثيقة', deliveryAddress: 'عنوان التسليم', tools: 'الأدوات', calculator: 'آلة حاسبة', marginCalculator: 'حاسبة الهامش', salePriceFromMargin: 'ثمن البيع حسب الهامش', purchaseCost: 'تكلفة الشراء', wantedMargin: 'الهامش المطلوب', result: 'النتيجة', clear: 'مسح', simplePrint: 'طباعة مبسطة', kpiRevenue: 'رقم المعاملات', kpiPurchases: 'حجم المشتريات', kpiCashIn: 'مجموع المقبوضات', kpiCashOut: 'مجموع المدفوعات', kpiStockQty: 'كمية المخزون', kpiOpenDocs: 'وثائق مفتوحة', kpiPaidRate: 'نسبة الفواتير المؤداة', kpiLowMargin: 'منتجات بهامش ضعيف', paymentList: 'لائحة المدفوعات', superAdmin: 'المدير العام للنظام', saasCenter: 'مركز SaaS', modulesCenter: 'إدارة الوحدات', databaseCenter: 'قاعدة البيانات', subscription: 'الاشتراك', plan: 'الباقة', enabled: 'مفعّل', disabled: 'غير مفعّل', moduleCode: 'رمز الوحدة', moduleName: 'اسم الوحدة', modulePrice: 'ثمن الوحدة', commercialPack: 'الباقة التجارية', tenant: 'الزبون / المستأجر', tenants: 'الزبناء / المستأجرون', databaseStats: 'إحصائيات قاعدة البيانات', tableName: 'الجدول', recordsCount: 'عدد السجلات', fixStockTransfer: 'تصحيح تحويل المخزون', moduleBilling: 'فوترة الوحدات', monthlyPrice: 'الثمن الشهري', yearlyPrice: 'الثمن السنوي', branchFilter: 'تصفية حسب الفرع', allBranches: 'كل الفروع', applyFilter: 'تطبيق التصفية', filteredByBranch: 'مصفي حسب الفرع', userFilter: 'تصفية حسب المستخدم', allUsers: 'كل المستخدمين', salesBySeller: 'رقم المعاملات حسب البائع', debtBySeller: 'الديون حسب البائع', salesPerformance: 'الأداء التجاري', collectionReport: 'تتبع التحصيل', marginBySeller: 'الهامش حسب البائع', unpaidBySeller: 'غير المحصل حسب البائع', docsByUser: 'الوثائق حسب المستخدم', creator: 'أنشأ بواسطة', seller: 'البائع', turnover: 'رقم المعاملات', collected: 'المحصل', outstanding: 'المتبقي', avgDelay: 'متوسط الأجل', reportSuggestions: 'تقارير مقترحة', backupCenter: 'نسخ احتياطي لقاعدة البيانات', backupJson: 'نسخة JSON', backupCsv: 'نسخة CSV', backupSql: 'سكريبت SQL', downloadBackup: 'تحميل النسخة', exportAll: 'تصدير الكل', localBackup: 'نسخ محلي', backupDate: 'تاريخ النسخ', backupTables: 'الجداول المحفوظة', restoreNote: 'الاسترجاع', databaseExport: 'تصدير قاعدة البيانات', fullBackup: 'نسخة كاملة', reporting: 'التقارير', customerDebts: 'ديون الزبناء', supplierDebts: 'ديون الموردين', totalDebt: 'إجمالي الدين', businessModules: 'وحدات العمل', platformModules: 'وحدات المنصة', protectedProfile: 'حساب محمي'
  }
};

// V48 — nouveaux libellés (caisse, inventaire, import, clôture, réappro, partage, sécurité)
Object.assign(TXT.fr, {
  "creditNote": "Avoir client",
  "creditNotes": "Avoirs clients",
  "supplierReturn": "Retour fournisseur",
  "supplierReturns": "Retours fournisseurs",
  "posMod": "Caisse rapide",
  "myPassword": "Mon mot de passe",
  "oldPassword": "Ancien mot de passe",
  "newPassword": "Nouveau mot de passe",
  "confirmPassword": "Confirmer le mot de passe",
  "exportReport": "Exporter le rapport",
  "documentsCount": "Nb documents",
  "grossMargin": "Marge brute",
  "status": "Statut",
  "module": "Module",
  "legalMoroccoNote": "Document commercial établi selon les informations déclarées par la société. Merci de vérifier les montants et la TVA avant validation.",
  "thankYou": "Merci pour votre confiance",
  "netToPay": "Net à payer",
  "retail": "détail",
  "wholesale": "gros",
  "wholesaleHint": "Appliqué aux clients au tarif « gros » (0 = prix détail)",
  "barcode": "Code-barres",
  "mainSupplier": "Fournisseur principal",
  "discount": "Remise %",
  "globalDiscount": "Remise globale %",
  "creditLimit": "Plafond de crédit",
  "noLimit": "Sans plafond",
  "priceTier": "Tarif",
  "creditOverride": "Plafond de crédit dépassé. Valider quand même (autorisation gérant) ?",
  "imputed": "Imputé sur la facture",
  "toRefund": "À rembourser au client",
  "toReceive": "À recevoir du fournisseur",
  "noRestock": "Sans retour en stock",
  "restockClient": "Remettre les articles en stock (marchandise rendue par le client)",
  "restockSupplier": "Sortir les articles du stock (marchandise renvoyée au fournisseur)",
  "returnHint": "Indiquez les quantités retournées. Le montant est imputé automatiquement sur la facture.",
  "scanBarcode": "Scanner code-barres / réf.",
  "productNotFound": "Produit introuvable",
  "cameraScan": "Caméra",
  "cameraUnsupported": "Scan caméra non pris en charge par ce navigateur (utilisez Chrome sur Android ou une douchette USB)",
  "cameraHint": "Placez le code-barres dans le cadre",
  "lastTicket": "Dernier ticket",
  "posSearch": "Rechercher un produit (nom, réf., code-barres)…",
  "walkInClient": "Client comptoir",
  "emptyCart": "Panier vide",
  "creditNeedsClient": "La vente à crédit nécessite un client enregistré",
  "notEnoughCash": "Montant reçu insuffisant",
  "cashReceived": "Montant reçu",
  "changeDue": "Monnaie à rendre",
  "posValidate": "Valider la vente",
  "posShortcuts": "F2 : recherche · F9 : valider · Échap : vider",
  "inventory": "Inventaire",
  "inventoryCount": "Comptage",
  "inventoryHint": "Saisissez les quantités comptées (ou scannez les articles : chaque scan ajoute 1). Le comptage est conservé sur cet appareil jusqu'à la validation. À la validation, l'écart est calculé sur le stock du moment et appliqué en mouvements de stock.",
  "inventoryReset": "Effacer le comptage",
  "inventoryNothing": "Aucune quantité comptée",
  "inventoryValidate": "Valider l'inventaire",
  "inventoryGaps": "écarts",
  "inventoryDone": "inventaire validé, stock corrigé",
  "inventoryOnlyGaps": "Écarts seulement",
  "inventoryPrefill": "Préremplir avec le stock théorique",
  "inventorySheet": "Feuille de comptage (CSV)",
  "inventoryCounted": "Compté",
  "inventoryGapValue": "Valeur écart (PMP)",
  "inventoryTheo": "Théorique",
  "inventoryGap": "Écart",
  "inventoryNotReady": "Historique indisponible : exécutez le script SQL V48.",
  "history": "Historique",
  "details": "Détails",
  "importExcel": "Import Excel",
  "importTemplate": "Télécharger le modèle",
  "importChoose": "Choisir un fichier (.xlsx / .csv)",
  "importNew": "nouveaux",
  "importUpdate": "mises à jour",
  "importErrors": "erreurs",
  "importStock": "Stock initial",
  "importStockIgnored": "ignoré (produit existant)",
  "importRun": "Importer",
  "importDone": "Import terminé",
  "importStocked": "stocks initiaux",
  "importHintProducts": "Téléchargez le modèle, remplissez-le dans Excel puis importez-le. Un produit déjà présent (même référence) est mis à jour ; le stock initial et son coût ne s'appliquent qu'aux nouveaux produits. Vous verrez un aperçu avant tout enregistrement.",
  "importHintParties": "Téléchargez le modèle, remplissez-le dans Excel puis importez-le. Un tiers déjà présent (même nom) est mis à jour. Vous verrez un aperçu avant tout enregistrement.",
  "cashClosure": "Clôture de caisse",
  "closureNotReady": "Exécutez le script SQL V48 pour enregistrer les clôtures.",
  "closureDone": "Journée clôturée",
  "closureByMode": "Règlements du jour par mode",
  "closureCash": "Contrôle des espèces",
  "closureOpening": "Fond de caisse (ouverture)",
  "closureCashIn": "Encaissements en espèces",
  "closureCashOut": "Règlements fournisseurs en espèces",
  "closureCashExpenses": "Charges payées en espèces",
  "closureExpected": "Espèces attendues",
  "closureCounted": "Espèces comptées",
  "closureBills": "Compter par billets et pièces",
  "closureGap": "Écart de caisse",
  "closureUpdate": "Mettre à jour la clôture",
  "closureValidate": "Clôturer la journée et imprimer",
  "closureCountedRequired": "Saisissez le montant des espèces comptées",
  "reorderAuto": "Réapprovisionner",
  "reorderHint": "Produits sous le stock minimum, en tenant compte des commandes clients en cours et des commandes fournisseurs déjà passées. Une commande fournisseur est créée par fournisseur.",
  "reorderCreated": "Commandes fournisseurs créées",
  "reorderSeePurchases": "Retrouvez-les dans Achats → Commandes.",
  "reorderNothing": "Aucun produit à réapprovisionner.",
  "reorderSupplierAll": "Fournisseur pour les lignes sans fournisseur",
  "reorderReserved": "Réservé",
  "reorderOnOrder": "Déjà commandé",
  "reorderCreate": "Créer les commandes fournisseurs",
  "pdfBuilding": "Préparation du PDF…",
  "share": "Partager",
  "email": "E-mail",
  "pdfAttached": "PDF joint",
  "closeBtn": "Fermer",
  "pm_Espèces": "Espèces",
  "pm_Carte": "Carte",
  "pm_Chèque": "Chèque",
  "pm_Virement": "Virement",
  "pm_Crédit": "Crédit"
  });
Object.assign(TXT.ar, {
  "creditNote": "إشعار دائن للزبون",
  "creditNotes": "إشعارات دائنة",
  "supplierReturn": "مرتجع للمورد",
  "supplierReturns": "مرتجعات الموردين",
  "posMod": "الصندوق السريع",
  "myPassword": "كلمة المرور",
  "oldPassword": "كلمة المرور الحالية",
  "newPassword": "كلمة المرور الجديدة",
  "confirmPassword": "تأكيد كلمة المرور",
  "exportReport": "تصدير التقرير",
  "status": "الحالة",
  "module": "الوحدة",
  "retail": "تقسيط",
  "wholesale": "جملة",
  "wholesaleHint": "يُطبَّق على زبناء الجملة (0 = ثمن التقسيط)",
  "barcode": "الرمز الشريطي",
  "mainSupplier": "المورد الرئيسي",
  "discount": "الخصم %",
  "globalDiscount": "خصم إجمالي %",
  "creditLimit": "سقف الائتمان",
  "noLimit": "بدون سقف",
  "priceTier": "التسعيرة",
  "creditOverride": "تم تجاوز سقف الائتمان. هل تريد التأكيد رغم ذلك (بإذن المسير)؟",
  "imputed": "مخصوم من الفاتورة",
  "toRefund": "يُرد للزبون",
  "toReceive": "يُستلم من المورد",
  "noRestock": "بدون إرجاع للمخزون",
  "restockClient": "إرجاع السلع إلى المخزون (سلع أرجعها الزبون)",
  "restockSupplier": "إخراج السلع من المخزون (سلع مرجعة للمورد)",
  "returnHint": "أدخل الكميات المرجعة. يُخصم المبلغ تلقائياً من الفاتورة.",
  "scanBarcode": "مسح الرمز الشريطي / المرجع",
  "productNotFound": "المنتج غير موجود",
  "cameraScan": "الكاميرا",
  "cameraUnsupported": "المسح بالكاميرا غير مدعوم في هذا المتصفح (استعمل Chrome على أندرويد أو قارئ USB)",
  "cameraHint": "ضع الرمز الشريطي داخل الإطار",
  "lastTicket": "آخر تذكرة",
  "posSearch": "ابحث عن منتج (الاسم، المرجع، الرمز الشريطي)…",
  "walkInClient": "زبون عابر",
  "emptyCart": "السلة فارغة",
  "creditNeedsClient": "البيع بالدين يتطلب زبوناً مسجلاً",
  "notEnoughCash": "المبلغ المستلم غير كافٍ",
  "cashReceived": "المبلغ المستلم",
  "changeDue": "الباقي للزبون",
  "posValidate": "تأكيد البيع",
  "posShortcuts": "F2 : بحث · F9 : تأكيد · Esc : إفراغ",
  "inventory": "الجرد",
  "inventoryCount": "العدّ",
  "inventoryHint": "أدخل الكميات المعدودة (أو امسح السلع: كل مسح يضيف 1). يُحفظ العدّ على هذا الجهاز حتى التأكيد. عند التأكيد يُحسب الفرق على المخزون الحالي ويُطبَّق كحركات مخزون.",
  "inventoryReset": "مسح العدّ",
  "inventoryNothing": "لم يتم عدّ أي كمية",
  "inventoryValidate": "تأكيد الجرد",
  "inventoryGaps": "فروقات",
  "inventoryDone": "تم تأكيد الجرد وتصحيح المخزون",
  "inventoryOnlyGaps": "الفروقات فقط",
  "inventoryPrefill": "ملء بالمخزون النظري",
  "inventorySheet": "ورقة العدّ (CSV)",
  "inventoryCounted": "المعدود",
  "inventoryGapValue": "قيمة الفرق",
  "inventoryTheo": "النظري",
  "inventoryGap": "الفرق",
  "inventoryNotReady": "السجل غير متوفر: نفّذ سكريبت SQL V48.",
  "history": "السجل",
  "details": "التفاصيل",
  "importExcel": "استيراد Excel",
  "importTemplate": "تحميل النموذج",
  "importChoose": "اختيار ملف (‎.xlsx / .csv)",
  "importNew": "جديد",
  "importUpdate": "تحديث",
  "importErrors": "أخطاء",
  "importStock": "المخزون الأولي",
  "importStockIgnored": "مُتجاهَل (منتج موجود)",
  "importRun": "استيراد",
  "importDone": "تم الاستيراد",
  "importStocked": "مخزونات أولية",
  "importHintProducts": "حمّل النموذج واملأه في Excel ثم استورده. المنتج الموجود (نفس المرجع) يتم تحديثه، والمخزون الأولي وتكلفته يطبقان فقط على المنتجات الجديدة. ستظهر معاينة قبل أي تسجيل.",
  "importHintParties": "حمّل النموذج واملأه في Excel ثم استورده. الطرف الموجود (نفس الاسم) يتم تحديثه. ستظهر معاينة قبل أي تسجيل.",
  "cashClosure": "إغلاق الصندوق",
  "closureNotReady": "نفّذ سكريبت SQL V48 لحفظ عمليات الإغلاق.",
  "closureDone": "تم إغلاق اليوم",
  "closureByMode": "أداءات اليوم حسب الطريقة",
  "closureCash": "مراقبة النقد",
  "closureOpening": "رصيد الافتتاح",
  "closureCashIn": "المقبوضات نقداً",
  "closureCashOut": "أداءات الموردين نقداً",
  "closureCashExpenses": "مصاريف مؤداة نقداً",
  "closureExpected": "النقد المتوقع",
  "closureCounted": "النقد المعدود",
  "closureBills": "العدّ حسب الأوراق والقطع",
  "closureGap": "فرق الصندوق",
  "closureUpdate": "تحديث الإغلاق",
  "closureValidate": "إغلاق اليوم والطباعة",
  "closureCountedRequired": "أدخل مبلغ النقد المعدود",
  "reorderAuto": "إعادة التزويد",
  "reorderHint": "المنتجات تحت الحد الأدنى، مع احتساب طلبيات الزبناء الجارية وطلبيات الموردين المرسلة. تُنشأ طلبية لكل مورد.",
  "reorderCreated": "تم إنشاء طلبيات الموردين",
  "reorderSeePurchases": "تجدها في المشتريات ← الطلبيات.",
  "reorderNothing": "لا توجد منتجات لإعادة التزويد.",
  "reorderSupplierAll": "مورد للأسطر بدون مورد",
  "reorderReserved": "محجوز",
  "reorderOnOrder": "مطلوب سابقاً",
  "reorderCreate": "إنشاء طلبيات الموردين",
  "pdfBuilding": "جاري إعداد PDF…",
  "share": "مشاركة",
  "email": "البريد الإلكتروني",
  "pdfAttached": "PDF مرفق",
  "closeBtn": "إغلاق",
  "pm_Espèces": "نقداً",
  "pm_Carte": "بطاقة",
  "pm_Chèque": "شيك",
  "pm_Virement": "تحويل",
  "pm_Crédit": "بالدين"
  });


// V49 — libellés du module Autorisations
Object.assign(TXT.fr, {
  "permProfiles": "Profils",
  "permByProfile": "Droits par profil",
  "permOverview": "Vue d'ensemble",
  "permFeatures": "Fonctions activées",
  "permSave": "Enregistrer",
  "permCancel": "Annuler les modifications",
  "permPending": "modification(s) non enregistrée(s)",
  "permSaved": "Droits enregistrés.",
  "permTemplate": "Appliquer un modèle",
  "permCopyFrom": "Copier les droits de…",
  "permAll": "Tout cocher",
  "permNone": "Tout décocher",
  "permNewProfile": "Nouveau profil",
  "permProfileName": "Nom du profil",
  "permProfileDesc": "Description",
  "permRename": "Renommer",
  "permDeleteProfile": "Supprimer le profil",
  "permDeleteConfirm": "Supprimer ce profil ? Ses droits seront perdus.",
  "permHasUsers": "Impossible : des utilisateurs ont encore ce profil.",
  "permBuiltIn": "Profil du système",
  "permUsersCount": "utilisateur(s)",
  "permRightsCount": "droit(s)",
  "permAlsoOn": "Activé aussi (nécessaire) :",
  "permAlsoOff": "Désactivé aussi (dépend de ce droit) :",
  "permLocked": "Verrouillé : vous ne pouvez pas retirer ce droit à votre propre profil ni à l'administrateur.",
  "permFeatureOff": "Fonction désactivée",
  "permFeatureOffHint": "Cette fonction est désactivée pour toute la droguerie (onglet Fonctions activées).",
  "permNotInPlan": "Non incluse dans l'abonnement",
  "permFeaturesHint": "Une fonction désactivée disparaît pour tous les utilisateurs, quels que soient leurs droits. Les données déjà saisies sont conservées.",
  "permFeaturesSaved": "Fonctions mises à jour.",
  "permSearch": "Rechercher un droit…",
  "permSuperAdminHidden": "Les droits de la plateforme SaaS sont masqués pour les profils métier.",
  "permModuleAll": "Tout le module",
  "permRequires": "Nécessite",
  "permUnsaved": "Des modifications ne sont pas enregistrées. Les abandonner ?",
  "permTplCashier": "Caissier",
  "permTplSeller": "Vendeur",
  "permTplStore": "Magasinier",
  "permTplManager": "Gérant",
  "permTplReadOnly": "Consultation seule",
  "permSqlMissing": "Le script SQL V49 n'est pas encore exécuté : certains droits n'existent pas dans la base. Exécutez MAJ_V49_SUPABASE.sql.",
  "permSelectProfile": "Choisissez un profil",
  "closureLocked": "Journée déjà clôturée : seuls les profils autorisés peuvent la modifier.",
  "bkTitle": "Sauvegarde complète : structure + données",
  "bkIntro": "La base génère elle-même un script qui recrée toutes les tables, contraintes, index, fonctions, règles de sécurité et toutes les données.",
  "bkLast": "Dernière sauvegarde depuis ce poste",
  "bkNeedSql": "Le script MAJ_V50_SUPABASE.sql n'est pas encore exécuté : seules les données des tables principales peuvent être sauvegardées (sans la structure). Exécutez-le dans Supabase pour la sauvegarde complète.",
  "bkTables": "Tables",
  "bkConstraints": "Contraintes",
  "bkIndexes": "Index",
  "bkFunctions": "Fonctions",
  "bkPolicies": "Règles de sécurité",
  "bkStructure": "Structure",
  "bkData": "Données",
  "bkFullSql": "Sauvegarde complète (SQL)",
  "bkFullSqlHint": "Structure + données dans un seul fichier. À rejouer dans un projet Supabase vide pour tout restaurer, comptes et mots de passe compris.",
  "bkSchemaSql": "Structure seule (SQL)",
  "bkSchemaSqlHint": "Tables, contraintes, index, séquences, fonctions, déclencheurs et sécurité, sans les données. Pour créer une base vierge identique.",
  "bkJsonHint": "Structure (script SQL) + données de toutes les tables au format JSON, pour un traitement automatique.",
  "bkCsvHint": "Un fichier CSV par table (données seulement), pour Excel.",
  "bkIncluded": "Contenu",
  "bkStructureOnly": "Structure seule (sessions)",
  "bkLegacyHint": "Données des tables principales uniquement, sans la structure.",
  "bkRestore1": "Créez un projet Supabase vide.",
  "bkRestore2": "Ouvrez SQL Editor, collez le fichier « Sauvegarde complète » et cliquez sur Run.",
  "bkRestore3": "Branchez l'application sur ce projet (URL et clé dans Vercel). Les utilisateurs se reconnectent avec leurs mots de passe habituels.",
  "bkPortable": "SQL normalisé (tout SGBD)",
  "bkPortableHint": "Structure (tables, clés primaires, uniques, étrangères, index) + toutes les données, écrites en SQL standard ou adaptées au SGBD choisi : MySQL / MariaDB, SQL Server, Oracle, SQLite, PostgreSQL.",
  "bkPortableNote": "Types, guillemets, booléens, dates et compteurs automatiques sont convertis pour le SGBD choisi. Les fonctions et règles de sécurité propres à PostgreSQL ne sont pas transposables : elles restent dans la sauvegarde complète Supabase.",
  "bkSecurity": "Le fichier contient toutes vos données, y compris les mots de passe chiffrés : conservez-le en lieu sûr. Les fichiers joints (Supabase Storage) ne sont pas inclus, seulement leurs références."
});
Object.assign(TXT.ar, {
  "permProfiles": "الأدوار",
  "permByProfile": "الصلاحيات حسب الدور",
  "permOverview": "نظرة شاملة",
  "permFeatures": "الوظائف المفعّلة",
  "permSave": "حفظ",
  "permCancel": "إلغاء التعديلات",
  "permPending": "تعديل(ات) غير محفوظة",
  "permSaved": "تم حفظ الصلاحيات.",
  "permTemplate": "تطبيق نموذج",
  "permCopyFrom": "نسخ صلاحيات…",
  "permAll": "تحديد الكل",
  "permNone": "إلغاء الكل",
  "permNewProfile": "دور جديد",
  "permProfileName": "اسم الدور",
  "permProfileDesc": "الوصف",
  "permRename": "إعادة التسمية",
  "permDeleteProfile": "حذف الدور",
  "permDeleteConfirm": "حذف هذا الدور؟ ستضيع صلاحياته.",
  "permHasUsers": "غير ممكن: ما زال مستخدمون مرتبطين بهذا الدور.",
  "permBuiltIn": "دور النظام",
  "permUsersCount": "مستخدم",
  "permRightsCount": "صلاحية",
  "permAlsoOn": "تم تفعيل (ضروري) أيضاً:",
  "permAlsoOff": "تم إلغاء (مرتبط بهذه الصلاحية) أيضاً:",
  "permLocked": "مقفل: لا يمكنك سحب هذه الصلاحية من دورك أو من المدير.",
  "permFeatureOff": "وظيفة معطّلة",
  "permFeatureOffHint": "هذه الوظيفة معطّلة لكل المحل (تبويب الوظائف المفعّلة).",
  "permNotInPlan": "غير مدرجة في الاشتراك",
  "permFeaturesHint": "الوظيفة المعطّلة تختفي عند كل المستخدمين مهما كانت صلاحياتهم. المعطيات المسجلة تبقى محفوظة.",
  "permFeaturesSaved": "تم تحديث الوظائف.",
  "permSearch": "البحث عن صلاحية…",
  "permSuperAdminHidden": "صلاحيات منصة SaaS مخفية بالنسبة لأدوار العمل.",
  "permModuleAll": "كل الوحدة",
  "permRequires": "تتطلب",
  "permUnsaved": "هناك تعديلات غير محفوظة. هل تريد التخلي عنها؟",
  "permTplCashier": "أمين الصندوق",
  "permTplSeller": "بائع",
  "permTplStore": "أمين المخزن",
  "permTplManager": "مسيّر",
  "permTplReadOnly": "اطلاع فقط",
  "permSqlMissing": "لم يتم تنفيذ سكريبت SQL V49 بعد: بعض الصلاحيات غير موجودة في قاعدة البيانات. نفّذ MAJ_V49_SUPABASE.sql.",
  "permSelectProfile": "اختر دوراً",
  "closureLocked": "اليوم مغلق: التعديل مسموح فقط للأدوار المرخص لها.",
  "bkTitle": "نسخة احتياطية كاملة: البنية + المعطيات",
  "bkIntro": "قاعدة البيانات تُنشئ بنفسها سكريبت يعيد إنشاء كل الجداول والقيود والفهارس والدوال وقواعد الأمان وكل المعطيات.",
  "bkLast": "آخر نسخة من هذا الجهاز",
  "bkNeedSql": "لم يتم تنفيذ MAJ_V50_SUPABASE.sql بعد: يمكن حفظ معطيات الجداول الرئيسية فقط (بدون البنية). نفّذه في Supabase للحصول على النسخة الكاملة.",
  "bkTables": "الجداول",
  "bkConstraints": "القيود",
  "bkIndexes": "الفهارس",
  "bkFunctions": "الدوال",
  "bkPolicies": "قواعد الأمان",
  "bkStructure": "البنية",
  "bkData": "المعطيات",
  "bkFullSql": "نسخة كاملة (SQL)",
  "bkFullSqlHint": "البنية + المعطيات في ملف واحد. يُنفَّذ في مشروع Supabase فارغ لاسترجاع كل شيء، بما فيه الحسابات وكلمات المرور.",
  "bkSchemaSql": "البنية فقط (SQL)",
  "bkSchemaSqlHint": "الجداول والقيود والفهارس والتسلسلات والدوال والمشغلات والأمان، بدون معطيات.",
  "bkJsonHint": "البنية (سكريبت SQL) + معطيات كل الجداول بصيغة JSON.",
  "bkCsvHint": "ملف CSV لكل جدول (المعطيات فقط)، لـ Excel.",
  "bkIncluded": "المحتوى",
  "bkStructureOnly": "البنية فقط (الجلسات)",
  "bkLegacyHint": "معطيات الجداول الرئيسية فقط، بدون البنية.",
  "bkRestore1": "أنشئ مشروع Supabase فارغاً.",
  "bkRestore2": "افتح SQL Editor، الصق ملف « النسخة الكاملة » واضغط Run.",
  "bkRestore3": "اربط التطبيق بهذا المشروع (الرابط والمفتاح في Vercel). يدخل المستخدمون بكلمات مرورهم المعتادة.",
  "bkPortable": "SQL موحّد (لكل أنظمة قواعد البيانات)",
  "bkPortableHint": "البنية (الجداول، المفاتيح الأساسية والفريدة والخارجية، الفهارس) + كل المعطيات، بلغة SQL القياسية أو مكيّفة للنظام المختار: MySQL / MariaDB، SQL Server، Oracle، SQLite، PostgreSQL.",
  "bkPortableNote": "تُحوَّل الأنواع وعلامات الاقتباس والقيم المنطقية والتواريخ والعدادات التلقائية حسب النظام المختار. الدوال وقواعد الأمان الخاصة بـ PostgreSQL غير قابلة للنقل: تبقى في النسخة الكاملة لـ Supabase.",
  "bkSecurity": "الملف يحتوي على كل معطياتك بما فيها كلمات المرور المشفرة: احفظه في مكان آمن. الملفات المرفقة (Supabase Storage) غير مدرجة، فقط مراجعها."
});

/* ---------- V49 : catalogue des droits ----------
   Chaque droit : code, libellé FR/AR, aide FR/AR, fonction (activable pour toute la droguerie). */
const PD = (code, fr, ar, dfr = '', dar = '', feature = null) => ({ code, fr, ar, dfr, dar, feature });
const PERM_MODULES = [
  { key: 'dashboard', fr: 'Tableau de bord et analyses', ar: 'لوحة التحكم والتحليلات', icon: '📊', perms: [
    PD('dashboard.read', 'Consulter le tableau de bord', 'الاطلاع على لوحة التحكم', 'Indicateurs du jour, alertes, activité récente.', 'مؤشرات اليوم والتنبيهات وآخر العمليات.'),
    PD('reporting.read', 'Reporting', 'التقارير', 'CA, encaissements, dettes et marges par vendeur ; relevés clients.', 'رقم المعاملات والتحصيل والديون والهوامش حسب البائع؛ كشوف الحساب.'),
    PD('profit.read', 'Centre de rentabilité', 'مركز الربحية', 'Marges par produit, prix conseillés, stock dormant.', 'الهوامش حسب المنتج، الأثمنة المقترحة، المخزون الراكد.', 'profit'),
    PD('tools.read', 'Outils et calculateurs', 'الأدوات والحاسبات', 'Calculatrice, calcul de marge et de prix de vente.', 'آلة حاسبة، حساب الهامش وثمن البيع.', 'tools'),
    PD('data.export', 'Exporter les données (CSV)', 'تصدير البيانات (CSV)', 'Boutons « Exporter CSV » des listes et du reporting.', 'أزرار « تصدير CSV » في اللوائح والتقارير.')
  ]},
  { key: 'pos', fr: 'Caisse rapide', ar: 'الصندوق السريع', icon: '🛒', feature: 'pos', perms: [
    PD('pos.use', 'Utiliser la caisse rapide', 'استعمال الصندوق السريع', 'Vente au comptoir : code-barres, encaissement et ticket.', 'البيع في الكونطوار: الكود بار، التحصيل والتذكرة.', 'pos'),
    PD('pos.discount', 'Remise en caisse', 'الخصم في الصندوق', 'Remise par ligne ou remise globale sur le ticket.', 'خصم على السطر أو خصم إجمالي على التذكرة.', 'pos'),
    PD('pos.credit', 'Vente à crédit en caisse', 'البيع بالدين في الصندوق', 'Mode de paiement « Crédit » (client enregistré obligatoire).', 'طريقة الأداء « بالدين » (زبون مسجل إلزامي).', 'pos')
  ]},
  { key: 'sales', fr: 'Ventes', ar: 'المبيعات', icon: '🧾', perms: [
    PD('sales.read', 'Consulter ses ventes', 'الاطلاع على مبيعاته', 'Devis, commandes, livraisons et factures créés par l\'utilisateur.', 'عروض الأسعار والطلبيات والتسليمات والفواتير التي أنشأها المستخدم.'),
    PD('sales.all', 'Voir les ventes de toute la droguerie', 'رؤية مبيعات كل المحل', 'Sinon, chaque utilisateur ne voit que ses propres documents.', 'وإلا فكل مستخدم يرى وثائقه فقط.'),
    PD('sales.write', 'Créer et faire avancer les ventes', 'إنشاء المبيعات وتقدّمها', 'Devis → commande → livraison → facture, livraisons partielles.', 'عرض السعر ← الطلبية ← التسليم ← الفاتورة، التسليم الجزئي.'),
    PD('sales.price_edit', 'Modifier le prix de vente', 'تعديل ثمن البيع', 'Changer le prix unitaire proposé sur une vente ou en caisse.', 'تغيير ثمن الوحدة المقترح في البيع أو في الصندوق.'),
    PD('sales.discount', 'Accorder des remises', 'منح الخصومات', 'Remise en % sur les lignes des documents de vente.', 'خصم بالنسبة المئوية على سطور وثائق البيع.'),
    PD('sales.pay', 'Encaisser', 'التحصيل', 'Enregistrer un règlement client (espèces, chèque, virement…).', 'تسجيل أداء الزبون (نقداً، شيك، تحويل…).'),
    PD('sales.return', 'Faire un avoir client', 'إنشاء إشعار دائن', 'Retour de marchandise, déduit de la facture et remis en stock.', 'إرجاع سلعة، يُخصم من الفاتورة ويعود للمخزون.', 'returns'),
    PD('sales.credit_override', 'Dépasser le plafond de crédit', 'تجاوز سقف الكريدي', 'Valider une vente même si le client dépasse son plafond.', 'تأكيد البيع حتى لو تجاوز الزبون سقفه.'),
    PD('sales.delete', 'Supprimer des ventes', 'حذف المبيعات', 'Suppression définitive d\'un document de vente.', 'حذف نهائي لوثيقة بيع.')
  ]},
  { key: 'purchases', fr: 'Achats', ar: 'المشتريات', icon: '📦', perms: [
    PD('purchases.read', 'Consulter ses achats', 'الاطلاع على مشترياته', 'Commandes, réceptions et factures fournisseurs créées par l\'utilisateur.', 'طلبيات واستلامات وفواتير الموردين التي أنشأها المستخدم.'),
    PD('purchases.all', 'Voir les achats de toute la droguerie', 'رؤية مشتريات كل المحل', 'Sinon, chaque utilisateur ne voit que ses propres documents.', 'وإلا فكل مستخدم يرى وثائقه فقط.'),
    PD('purchases.write', 'Créer et réceptionner les achats', 'إنشاء المشتريات واستلامها', 'Commande → réception (entrée en stock) → facture.', 'الطلبية ← الاستلام (دخول المخزون) ← الفاتورة.'),
    PD('purchases.pay', 'Régler les fournisseurs', 'أداء الموردين', 'Enregistrer un règlement fournisseur.', 'تسجيل أداء لمورد.'),
    PD('purchases.return', 'Faire un retour fournisseur', 'إرجاع للمورد', 'Marchandise renvoyée, sortie du stock et déduite de la facture.', 'سلعة مرجعة، تخرج من المخزون وتُخصم من الفاتورة.', 'returns'),
    PD('purchases.delete', 'Supprimer des achats', 'حذف المشتريات', 'Suppression définitive d\'un document d\'achat.', 'حذف نهائي لوثيقة شراء.')
  ]},
  { key: 'cash', fr: 'Paiements et clôture de caisse', ar: 'المدفوعات وإغلاق الصندوق', icon: '💵', perms: [
    PD('payments.read', 'Consulter les paiements', 'الاطلاع على المدفوعات', 'Liste des encaissements et décaissements.', 'لائحة المقبوضات والمدفوعات.'),
    PD('payments.cancel', 'Annuler un paiement', 'إلغاء أداء', 'Annulation d\'un règlement avec motif (tracé).', 'إلغاء أداء مع ذكر السبب (مسجّل).'),
    PD('cash.close', 'Clôturer la caisse du jour', 'إغلاق صندوق اليوم', 'Comptage des espèces et validation de la journée.', 'عدّ النقد وتأكيد اليوم.', 'cashClosure'),
    PD('cash.reopen', 'Modifier une journée déjà clôturée', 'تعديل يوم مغلق', 'Corriger une clôture déjà validée.', 'تصحيح إغلاق تم تأكيده.', 'cashClosure')
  ]},
  { key: 'products', fr: 'Produits', ar: 'المنتجات', icon: '🏷️', perms: [
    PD('products.read', 'Consulter les produits', 'الاطلاع على المنتجات', 'Catalogue, prix et quantités.', 'الكتالوج والأثمنة والكميات.'),
    PD('products.write', 'Créer et modifier les produits', 'إنشاء وتعديل المنتجات', 'Fiches produits, catégories et unités.', 'بطاقات المنتجات، الأصناف والوحدات.'),
    PD('products.import', 'Importer les produits (Excel)', 'استيراد المنتجات (Excel)', 'Les clients et fournisseurs s\'importent avec le droit « Créer et modifier » correspondant.', 'الزبناء والموردون يُستوردون بصلاحية « إنشاء وتعديل » الخاصة بهم.', 'import'),
    PD('products.delete', 'Supprimer des produits', 'حذف المنتجات', 'Suppression d\'une fiche produit.', 'حذف بطاقة منتج.')
  ]},
  { key: 'stock', fr: 'Stock', ar: 'المخزون', icon: '🏬', perms: [
    PD('stock.read', 'Consulter le stock et ses mouvements', 'الاطلاع على المخزون وحركاته', 'Historique des entrées et sorties.', 'سجل المداخيل والمخارج.'),
    PD('stock.adjust', 'Ajuster le stock', 'تعديل المخزون', 'Entrée ou sortie manuelle avec motif.', 'إدخال أو إخراج يدوي مع السبب.'),
    PD('stock.transfer', 'Transférer entre drogueries', 'التحويل بين المحلات', 'Envoyer du stock vers une autre droguerie.', 'إرسال مخزون إلى محل آخر.'),
    PD('stock.inventory', 'Faire l\'inventaire', 'إجراء الجرد', 'Comptage physique et correction des écarts.', 'العدّ الفعلي وتصحيح الفروقات.', 'inventory'),
    PD('stock.reorder', 'Réapprovisionnement automatique', 'إعادة التزويد التلقائية', 'Créer les commandes fournisseurs proposées.', 'إنشاء طلبيات الموردين المقترحة.', 'reorder')
  ]},
  { key: 'clients', fr: 'Clients', ar: 'الزبناء', icon: '👥', perms: [
    PD('clients.read', 'Consulter les clients', 'الاطلاع على الزبناء', 'Fiches clients et encours.', 'بطاقات الزبناء والمتبقي.'),
    PD('clients.write', 'Créer et modifier les clients', 'إنشاء وتعديل الزبناء', 'Coordonnées, ICE, adresse.', 'المعلومات، ICE، العنوان.'),
    PD('clients.credit_limit', 'Fixer tarif et plafond de crédit', 'تحديد التسعيرة وسقف الكريدي', 'Tarif gros/détail et plafond de crédit du client.', 'تسعيرة الجملة/التقسيط وسقف كريدي الزبون.'),
    PD('clients.assign', 'Affecter un client à un vendeur', 'ربط زبون ببائع', 'Choisir le commercial responsable du client.', 'اختيار البائع المسؤول عن الزبون.'),
    PD('clients.delete', 'Supprimer des clients', 'حذف الزبناء', 'Suppression d\'une fiche client.', 'حذف بطاقة زبون.')
  ]},
  { key: 'suppliers', fr: 'Fournisseurs', ar: 'الموردون', icon: '🚚', perms: [
    PD('suppliers.read', 'Consulter les fournisseurs', 'الاطلاع على الموردين'),
    PD('suppliers.write', 'Créer et modifier les fournisseurs', 'إنشاء وتعديل الموردين'),
    PD('suppliers.delete', 'Supprimer des fournisseurs', 'حذف الموردين')
  ]},
  { key: 'expenses', fr: 'Charges et déplacements', ar: 'المصاريف والتنقلات', icon: '⛽', feature: 'expenses', perms: [
    PD('expenses.read', 'Consulter les charges et déplacements', 'الاطلاع على المصاريف والتنقلات', 'L\'utilisateur voit les siens ; gérant et administrateur voient tout.', 'المستخدم يرى ما يخصه؛ المسيّر والمدير يريان الكل.', 'expenses'),
    PD('expenses.write', 'Saisir des charges et déplacements', 'تسجيل المصاريف والتنقلات', '', '', 'expenses')
  ]},
  { key: 'admin', fr: 'Administration', ar: 'الإدارة', icon: '⚙️', perms: [
    PD('users.read', 'Consulter les utilisateurs', 'الاطلاع على المستخدمين'),
    PD('users.write', 'Créer et modifier les utilisateurs', 'إنشاء وتعديل المستخدمين', 'Comptes, profils, mots de passe, désactivation.', 'الحسابات، الأدوار، كلمات المرور، التعطيل.'),
    PD('settings.manage', 'Paramètres et fonctions', 'الإعدادات والوظائف', 'Identité de la société, alertes, fonctions activées.', 'معلومات الشركة، التنبيهات، الوظائف المفعّلة.'),
    PD('permissions.manage', 'Gérer les autorisations', 'إدارة الصلاحيات', 'Cette page : profils et droits.', 'هذه الصفحة: الأدوار والصلاحيات.'),
    PD('branches.manage', 'Gérer les drogueries', 'إدارة المحلات', 'Points de vente et responsables.', 'نقط البيع والمسؤولون.'),
    PD('mobile.manage', 'Application mobile', 'تطبيق الهاتف'),
    PD('audit.read', 'Consulter la traçabilité', 'الاطلاع على سجل العمليات', 'Journal de qui a fait quoi et quand.', 'سجل من فعل ماذا ومتى.')
  ]},
  { key: 'saas', fr: 'Plateforme SaaS', ar: 'منصة SaaS', icon: '☁️', saas: true, perms: [
    PD('superadmin.manage', 'Centre SuperAdmin', 'مركز المدير العام'),
    PD('modules.manage', 'Gérer les modules et abonnements', 'إدارة الوحدات والاشتراكات'),
    PD('database.manage', 'Base de données', 'قاعدة البيانات'),
    PD('backup.manage', 'Sauvegardes', 'النسخ الاحتياطي')
  ]}
];
const PERM_INDEX = Object.fromEntries(PERM_MODULES.flatMap(m => m.perms.map(p => [p.code, { ...p, module: m.key }])));

// Droits nécessaires : activer un droit active aussi ceux dont il dépend ; désactiver un droit désactive ceux qui en dépendent.
const PERM_DEPS = {
  'pos.use': ['sales.write', 'products.read'], 'pos.discount': ['pos.use'], 'pos.credit': ['pos.use'],
  'sales.all': ['sales.read'], 'sales.write': ['sales.read', 'clients.read', 'products.read'],
  'sales.price_edit': ['sales.write'], 'sales.discount': ['sales.write'], 'sales.pay': ['sales.read'],
  'sales.return': ['sales.write'], 'sales.credit_override': ['sales.write'], 'sales.delete': ['sales.write'],
  'purchases.all': ['purchases.read'], 'purchases.write': ['purchases.read', 'suppliers.read', 'products.read'],
  'purchases.pay': ['purchases.read'], 'purchases.return': ['purchases.write'], 'purchases.delete': ['purchases.write'],
  'payments.cancel': ['payments.read'], 'cash.reopen': ['cash.close'],
  'products.write': ['products.read'], 'products.delete': ['products.write'], 'products.import': ['products.write'],
  'stock.read': ['products.read'], 'stock.adjust': ['stock.read'], 'stock.transfer': ['stock.read'],
  'stock.inventory': ['stock.read'], 'stock.reorder': ['stock.read', 'purchases.write'],
  'clients.write': ['clients.read'], 'clients.credit_limit': ['clients.write'], 'clients.assign': ['clients.read'], 'clients.delete': ['clients.write'],
  'suppliers.write': ['suppliers.read'], 'suppliers.delete': ['suppliers.write'],
  'expenses.write': ['expenses.read'], 'users.write': ['users.read']
};

function permWithDeps(codes, code) {
  const set = new Set(codes);
  const added = [];
  (function add(c) {
    for (const d of PERM_DEPS[c] || []) if (!set.has(d)) { set.add(d); added.push(d); add(d); }
  })(code);
  set.add(code);
  return { set, added };
}

function permWithoutDependents(codes, code) {
  const set = new Set(codes);
  set.delete(code);
  const removed = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of [...set]) {
      if ((PERM_DEPS[c] || []).some(d => !set.has(d))) { set.delete(c); removed.push(c); changed = true; }
    }
  }
  return { set, removed };
}

// Modèles de profils (les dépendances sont ajoutées automatiquement)
const ROLE_TEMPLATES = [
  { key: 'cashier', label: 'permTplCashier', codes: ['dashboard.read', 'pos.use', 'sales.pay', 'payments.read', 'cash.close', 'stock.read'] },
  { key: 'seller', label: 'permTplSeller', codes: ['dashboard.read', 'reporting.read', 'pos.use', 'pos.discount', 'pos.credit', 'sales.write', 'sales.discount', 'sales.pay', 'clients.write', 'stock.read', 'payments.read', 'cash.close', 'expenses.write'] },
  { key: 'store', label: 'permTplStore', codes: ['dashboard.read', 'products.write', 'products.import', 'stock.adjust', 'stock.transfer', 'stock.inventory', 'stock.reorder', 'suppliers.write', 'purchases.write', 'purchases.return', 'expenses.read'] },
  { key: 'manager', label: 'permTplManager', codes: PERM_MODULES.filter(m => !['admin', 'saas'].includes(m.key)).flatMap(m => m.perms.map(p => p.code)).concat(['users.read', 'audit.read']) },
  { key: 'readonly', label: 'permTplReadOnly', codes: ['dashboard.read', 'reporting.read', 'profit.read', 'tools.read', 'sales.read', 'sales.all', 'purchases.read', 'purchases.all', 'payments.read', 'products.read', 'stock.read', 'clients.read', 'suppliers.read', 'expenses.read'] }
];

function templateCodes(tpl) {
  let set = new Set();
  for (const c of tpl.codes) set = permWithDeps(set, c).set;
  return set;
}

// Fonctions activables pour toute la droguerie (en plus des modules de l'abonnement SaaS)
const FEATURES = [
  { key: 'pos', saas: 'pos', icon: '🛒', fr: 'Caisse rapide', ar: 'الصندوق السريع', dfr: 'Vente au comptoir avec code-barres et ticket.', dar: 'البيع في الكونطوار بالكود بار والتذكرة.' },
  { key: 'cashClosure', icon: '💵', fr: 'Clôture de caisse', ar: 'إغلاق الصندوق', dfr: 'Comptage des espèces et écart de caisse chaque soir.', dar: 'عدّ النقد وفرق الصندوق كل مساء.' },
  { key: 'inventory', icon: '📋', fr: 'Inventaire physique', ar: 'الجرد الفعلي', dfr: 'Comptage du stock et correction des écarts.', dar: 'عدّ المخزون وتصحيح الفروقات.' },
  { key: 'reorder', icon: '🔁', fr: 'Réapprovisionnement automatique', ar: 'إعادة التزويد التلقائية', dfr: 'Commandes fournisseurs proposées sous le stock minimum.', dar: 'طلبيات موردين مقترحة تحت الحد الأدنى.' },
  { key: 'import', icon: '📥', fr: 'Import Excel', ar: 'الاستيراد من Excel', dfr: 'Import des produits, clients et fournisseurs.', dar: 'استيراد المنتجات والزبناء والموردين.' },
  { key: 'returns', icon: '↩️', fr: 'Avoirs et retours fournisseurs', ar: 'الإشعارات الدائنة والمرتجعات', dfr: 'Retours clients et fournisseurs sur facture.', dar: 'مرتجعات الزبناء والموردين على الفاتورة.' },
  { key: 'share', icon: '📤', fr: 'Partage WhatsApp / e-mail / PDF', ar: 'المشاركة واتساب / بريد / PDF', dfr: 'Envoi des documents depuis l\'aperçu.', dar: 'إرسال الوثائق من المعاينة.' },
  { key: 'expenses', saas: 'expenses', icon: '⛽', fr: 'Charges et déplacements', ar: 'المصاريف والتنقلات', dfr: 'Tournées, charges et marge nette.', dar: 'الجولات والمصاريف والهامش الصافي.' },
  { key: 'profit', saas: 'profit', icon: '📈', fr: 'Centre de rentabilité', ar: 'مركز الربحية', dfr: 'Analyse des marges par produit.', dar: 'تحليل الهوامش حسب المنتج.' },
  { key: 'tools', saas: 'tools', icon: '🧮', fr: 'Outils et calculateurs', ar: 'الأدوات والحاسبات', dfr: 'Calculatrice et calcul de prix.', dar: 'آلة حاسبة وحساب الأثمنة.' }
];

function curLang() {
  try { return localStorage.getItem('lang') || 'fr'; } catch { return 'fr'; }
}
// Libellé (tr) et aide (trd) dans la langue de l'interface
function tr(obj) {
  return (curLang() === 'ar' ? obj?.ar : obj?.fr) || obj?.fr || '';
}
function trd(obj) {
  return (curLang() === 'ar' ? obj?.dar : obj?.dfr) || obj?.dfr || '';
}

function getFeaturesOff() {
  try { return JSON.parse(localStorage.getItem('droguerie_features_off') || '[]') || []; } catch { return []; }
}

// Une fonction est disponible si l'abonnement l'inclut ET si l'administrateur ne l'a pas désactivée
function featureOn(key) {
  const f = FEATURES.find(x => x.key === key);
  if (f?.saas && getDisabledModulesCache().includes(f.saas)) return false;
  return !getFeaturesOff().includes(key);
}

// Droit + fonction activée
function canUse(code) {
  const feature = PERM_INDEX[code]?.feature;
  return can(code) && (!feature || featureOn(feature));
}


// V49 : tant que le script SQL V49 n'est pas exécuté, les nouveaux droits suivent les anciens (aucune régression)
const LEGACY_EQUIV = {
  'pos.use': 'sales.write', 'pos.discount': 'sales.write', 'pos.credit': 'sales.write',
  'sales.price_edit': 'sales.write', 'sales.discount': 'sales.write', 'sales.return': 'sales.write',
  'purchases.return': 'purchases.write', 'cash.close': ['payments.read', 'sales.pay'],
  'stock.inventory': 'stock.adjust', 'stock.reorder': 'purchases.write', 'products.import': 'products.write',
  'clients.credit_limit': 'clients.write', 'profit.read': 'dashboard.read', 'tools.read': 'dashboard.read',
  'expenses.read': 'dashboard.read', 'expenses.write': 'dashboard.read', 'data.export': 'dashboard.read',
  'sales.all': '@manager', 'purchases.all': '@manager', 'sales.credit_override': '@manager', 'cash.reopen': '@manager'
};

function permCatalogReady() {
  try { return localStorage.getItem('droguerie_perm_v49') === '1'; } catch { return false; }
}

function hasPerm(session, code) {
  const perms = Array.isArray(session?.perms) ? session.perms : [];
  if (perms.includes(code)) return true;
  if (permCatalogReady()) return false;
  const legacy = LEGACY_EQUIV[code];
  if (!legacy) return false;
  if (legacy === '@manager') return isAdmin(session) || isManager(session);
  return [].concat(legacy).some(c => perms.includes(c));
}

function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem('droguerie_session') || 'null');
  } catch {
    return null;
  }
}

function setStoredSession(s) {
  localStorage.setItem('droguerie_session', JSON.stringify(s));
}

function clearStoredSession() {
  localStorage.removeItem('droguerie_session');
}

async function logoutSession() {
  try { if (await isSecureBackend()) await supabase.rpc('app_logout'); } catch {}
  clearStoredSession();
}

// Renvoie false si la session n'est plus valide (expirée, compte désactivé, ancienne session sans jeton)
async function checkSessionStillValid() {
  const s = getStoredSession();
  if (!s) return false;
  if (!(await isSecureBackend())) return true;
  if (!s.token) return false;
  const { data, error } = await supabase.rpc('app_session_info');
  if (error) return true; // réseau indisponible : on ne déconnecte pas
  return !!data;
}

async function changeOwnPassword(oldPassword, newPassword) {
  const s = getStoredSession();
  if (!(await isSecureBackend())) {
    const { data } = await supabase.from('users').select('password_hash').eq('id', s.user.id).single();
    if (data?.password_hash !== oldPassword) throw new Error('Ancien mot de passe incorrect');
    const { error } = await supabase.from('users').update({ password_hash: newPassword }).eq('id', s.user.id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase.rpc('app_set_password', { p_user_id: s.user.id, p_new_password: newPassword, p_old_password: oldPassword });
  if (error) throw rpcError(error);
}

async function getUserPermissions(userId) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, role_id')
    .eq('id', userId)
    .single();

  if (userError) throw new Error(userError.message);

  if (!user?.role_id) {
    return [];
  }

  const { data, error } = await supabase
    .from('role_permissions')
    .select('permissions(code)')
    .eq('role_id', user.role_id);

  if (error) throw new Error(error.message);

  return (data || [])
    .map(x => x.permissions?.code)
    .filter(Boolean);
}


function can(code) {
  return hasPerm(getStoredSession(), code);
}

// Droit + fonction activée, sinon erreur
function requireUse(code, label = 'Action') {
  if (!canUse(code)) throw new Error(label + ' non autorisée');
}

function requirePerm(code, label = 'Action') {
  if (!can(code)) {
    throw new Error(label + ' non autorisée');
  }
}

function currentBranchId() {
  return branchId(getStoredSession());
}

function branchScopePayload(payload = {}) {
  const session = getStoredSession();
  if (isAdmin(session)) {
    return { ...payload, branch_id: payload.branch_id || payload.branchId || branchId(session) || null };
  }
  return { ...payload, branch_id: branchId(session) };
}

async function getProductBranchId(productId) {
  const { data, error } = await supabase.from('products').select('branch_id').eq('id', productId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.branch_id || null;
}

async function assertProductInUserBranch(productId) {
  const session = getStoredSession();
  if (isAdmin(session)) return;
  const pBranch = await getProductBranchId(productId);
  if (Number(pBranch || 0) !== Number(branchId(session) || 0)) {
    throw new Error('Produit non autorisé : il appartient à une autre droguerie');
  }
}



const PARTY_PERMS = {
  clients: { read: 'clients.read', write: 'clients.write', delete: 'clients.delete' },
  suppliers: { read: 'suppliers.read', write: 'suppliers.write', delete: 'suppliers.delete' }
};

function roleName(session = getStoredSession()) {
  return session?.user?.role || '';
}

function canManageAllBranchData(session = getStoredSession()) {
  return isAdmin(session) || isManager(session);
}

function canSeePartyRecord(record, type, session = getStoredSession()) {
  if (isAdmin(session)) return true;
  if (isManager(session)) return Number(record.branch_id || 0) === Number(branchId(session) || 0);

  if (type === 'clients') {
    return Number(record.assigned_to || 0) === Number(session?.user?.id || 0)
      || Number(record.created_by || 0) === Number(session?.user?.id || 0);
  }

  return Number(record.branch_id || 0) === Number(branchId(session) || 0);
}

function enrichParties(rows, usersMap = {}) {
  return (rows || []).map(x => ({
    ...x,
    createdByLabel: usersMap[x.created_by] || (x.created_by ? ('User #' + x.created_by) : '-'),
    assignedToLabel: usersMap[x.assigned_to] || (x.assigned_to ? ('User #' + x.assigned_to) : '-')
  }));
}

async function loadBranchStockSummary() {
  const session = getStoredSession();
  let q = supabase
    .from('products')
    .select('id, quantity, min_stock, purchase_price, branch_id, branches(name)');

  if (isAdmin(session) || isSuperAdmin(session)) {
    q = applyBranchFilterToQuery(q, session);
  } else if (branchId(session)) {
    q = q.eq('branch_id', branchId(session));
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const byBranch = {};
  (data || []).forEach(p => {
    const id = p.branch_id || 0;
    const name = p.branches?.name || 'Sans droguerie';
    if (!byBranch[id]) byBranch[id] = { branchId: id, branchName: name, products: 0, qty: 0, value: 0, lowStock: 0 };
    byBranch[id].products += 1;
    byBranch[id].qty += Number(p.quantity || 0);
    byBranch[id].value += Number(p.quantity || 0) * Number(p.purchase_price || 0);
    if (Number(p.quantity || 0) <= Number(p.min_stock || 0)) byBranch[id].lowStock += 1;
  });

  return Object.values(byBranch);
}

async function transferStock({ productId, toBranchId, quantity, reason }) {
  if (!(can('stock.transfer') || can('stock.adjust'))) throw new Error('Transfert stock non autorisé');

  const qty = Number(quantity || 0);
  if (!productId || !toBranchId || qty <= 0) throw new Error('Transfert stock invalide');

  if (await isSecureBackend()) {
    const { data, error } = await supabase.rpc('app_stock_transfer', { p_product_id: Number(productId), p_to_branch: Number(toBranchId), p_qty: qty, p_reason: reason || 'Transfert stock' });
    if (error) throw rpcError(error);
    await auditLog('Stock', 'TRANSFER', data, 'Transfert ' + qty + ' vers droguerie #' + toBranchId);
    return;
  }

  const session = getStoredSession();
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) throw new Error(error.message);

  if (!isAdmin(session) && Number(product.branch_id || 0) !== Number(branchId(session) || 0)) {
    throw new Error('Transfert refusé : produit hors droguerie utilisateur');
  }

  if (Number(product.branch_id || 0) === Number(toBranchId)) {
    throw new Error('La droguerie destination doit être différente');
  }

  if (Number(product.quantity || 0) < qty) {
    throw new Error('Stock insuffisant pour le transfert');
  }

  const docNumber = 'TRF-' + new Date().getFullYear() + '-' + Date.now();

  // Important V39 :
  // L'ancienne version diminuait la source avant d'insérer la cible.
  // Si products_ref_key existait encore, l'insertion cible échouait et le stock source restait diminué.
  // Maintenant on prépare/valide la cible avant la sortie source.
  const { data: destProduct, error: destErr } = await supabase
    .from('products')
    .select('*')
    .eq('ref', product.ref)
    .eq('branch_id', toBranchId)
    .maybeSingle();

  if (destErr) throw new Error(destErr.message);

  let destProductId = destProduct?.id || null;

  if (!destProductId) {
    const copy = {
      ref: product.ref,
      name: product.name,
      name_ar: product.name_ar || '',
      category: product.category || '',
      unit: product.unit || 'Pièce',
      purchase_price: product.purchase_price || 0,
      sale_price: product.sale_price || 0,
      quantity: 0,
      min_stock: product.min_stock || 0,
      supplier_id: product.supplier_id || null,
      branch_id: toBranchId
    };

    const { data: inserted, error: insErr } = await supabase
      .from('products')
      .insert(copy)
      .select('id')
      .single();

    if (insErr) {
      throw new Error(
        'Impossible de créer le produit dans la droguerie cible. Exécute d’abord sql_v39_saas_superadmin_stock_fix.sql pour remplacer la contrainte products_ref_key par une contrainte (ref, branch_id). Détail: ' + insErr.message
      );
    }

    destProductId = inserted.id;
  }

  const { data: targetNow, error: targetReadErr } = await supabase
    .from('products')
    .select('quantity, purchase_price')
    .eq('id', destProductId)
    .single();

  if (targetReadErr) throw new Error(targetReadErr.message);

  // PMP destination = moyenne pondérée avec le PMP de la droguerie source
  const destQty = Math.max(0, Number(targetNow.quantity || 0));
  const srcPmp = Number(product.purchase_price || 0);
  const destPmp = Number(targetNow.purchase_price || 0);
  const newDestPmp = srcPmp > 0 ? Number(((destQty * destPmp + qty * srcPmp) / (destQty + qty)).toFixed(4)) : destPmp;

  const { error: targetUpdateErr } = await supabase
    .from('products')
    .update({ quantity: Number(targetNow.quantity || 0) + qty, purchase_price: newDestPmp })
    .eq('id', destProductId);

  if (targetUpdateErr) throw new Error(targetUpdateErr.message);

  try {
    await updateStock([{ produitId: product.id, qte: qty }], -1, reason || 'Transfert stock sortie', { docType: 'Transfert', docNumber });
  } catch (e) {
    // Compensation simple si la sortie source échoue après entrée cible.
    await supabase
      .from('products')
      .update({ quantity: Number(targetNow.quantity || 0), purchase_price: destPmp })
      .eq('id', destProductId);
    throw e;
  }

  await supabase.from('stock_movements').insert({
    product_id: destProductId,
    quantity: qty,
    reason: reason || 'Transfert stock entrée',
    branch_id: toBranchId,
    doc_type: 'Transfert',
    doc_number: docNumber,
    user_id: session?.user?.id || null,
    user_label: currentUserLabel(),
    created_at: new Date().toISOString()
  });

  await auditLog('Stock', 'TRANSFER', docNumber, 'Transfert stock vers droguerie #' + toBranchId + ' quantité ' + qty);
}



const BACKUP_TABLES = [
  'roles', 'permissions', 'role_permissions',
  'branches', 'users',
  'products', 'stock_movements',
  'clients', 'suppliers',
  'sales', 'purchases',
  'app_settings', 'saas_modules', 'tenants', 'tenant_modules', 'audit_logs'
];

async function exportTableData(table) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.warn('Backup table error', table, error.message);
    return { table, rows: [], error: error.message };
  }
  return { table, rows: data || [], error: null };
}

function sqlLiteral(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'object') return "'" + JSON.stringify(v).replaceAll("'", "''") + "'::jsonb";
  return "'" + String(v).replaceAll("'", "''") + "'";
}

function rowsToInsertSql(table, rows) {
  if (!rows || !rows.length) return '-- Table ' + table + ' : aucune donnée\n';
  const cols = Object.keys(rows[0]);
  const values = rows.map(r => '(' + cols.map(c => sqlLiteral(r[c])).join(', ') + ')').join(',\n');
  return `-- Données ${table}\nINSERT INTO ${table} (${cols.join(', ')}) VALUES\n${values}\nON CONFLICT DO NOTHING;\n\n`;
}

function backupToSql(backup) {
  const head = `-- DrogueriePro backup SQL\n-- Date: ${backup.createdAt}\n-- Version: V46\n\n`;
  return head + backup.tables.map(t => rowsToInsertSql(t.table, t.rows)).join('\n');
}

async function buildFullBackup() {
  const tables = [];
  for (const table of BACKUP_TABLES) {
    tables.push(await exportTableData(table));
  }
  return {
    app: 'DrogueriePro',
    version: 'V46',
    createdAt: new Date().toISOString(),
    tables
  };
}

function downloadTextFile(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(filename, rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) {
    alert('Aucune donnée à exporter');
    return;
  }
  const headers = Object.keys(list[0]);
  const csv = [
    headers.join(';'),
    ...list.map(row => headers.map(h => `"${String(row[h] ?? '').replaceAll('"', '""')}"`).join(';'))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function loadProDashboardData() {
  const session = getStoredSession();
  await loadSettings().catch(() => null); // rafraîchit les réglages d'alertes
  const [
    { data: products },
    { data: sales },
    { data: purchases },
    { data: clients },
    { data: suppliers },
    movements,
    tripsData,
    expensesData
  ] = await Promise.all([
    applyProductScope(supabase.from('products').select('*, branches(name)'), session),
    applyDocScope(supabase.from('sales').select('*'), 'sales', session),
    applyDocScope(supabase.from('purchases').select('*'), 'purchases', session),
    applyBranchFilterToQuery(supabase.from('clients').select('*'), session),
    applyBranchFilterToQuery(supabase.from('suppliers').select('*'), session),
    loadStockMovements().catch(() => []),
    loadTrips().catch(() => []),
    loadExpenses().catch(() => [])
  ]);

  const prod = (products || []).map(mapProduct);
  const docsSales = (sales || []).map(mapDoc);
  const docsPurchases = (purchases || []).map(mapDoc);
  const todayKey = today();

  // Activité déplacements/charges (déjà filtrée par utilisateur via loadTrips/loadExpenses)
  const myTrips = tripsData || [];
  const myExpenses = expensesData || [];
  const myChargesTotal = myExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const myTripNetMargin = myTrips.reduce((acc, t) => {
    const gm = docsSales
      .filter(d => String(d.trip_id || '') === String(t.id) && d.stage === 'facture')
      .reduce((s, d) => s + documentProfit(d).margin, 0);
    const ch = myExpenses
      .filter(e => String(e.trip_id || '') === String(t.id))
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    return acc + (gm - ch);
  }, 0);

  const todaySales = docsSales.filter(d => d.date === todayKey).reduce((s, d) => s + revenueTTC(d), 0);
  const unpaidInvoices = [...docsSales, ...docsPurchases].filter(d => d.stage === 'facture' && d.statutPaiement !== 'paid').length;
  const stockAlerts = prod.filter(p => isLowStockAlert(p)).length;
  const expiryAlerts = prod.filter(p => isExpiryAlert(p)).length;
  const overdueInvoices = docsSales.filter(d => isOverdueInvoice(d)).length;
  const stockValue = prod.reduce((s, p) => s + Number(p.quantite || 0) * Number(p.prixAchat || 0), 0);

  return {
    products: prod,
    sales: docsSales,
    purchases: docsPurchases,
    clients: clients || [],
    suppliers: suppliers || [],
    movements: movements || [],
    kpis: {
      todaySales,
      unpaidInvoices,
      stockAlerts,
      stockValue,
      purchasesTotal: docsPurchases.reduce((s, d) => s + revenueTTC(d), 0),
      salesTotal: docsSales.reduce((s, d) => s + revenueTTC(d), 0),
      cashInTotal: paymentSum(docsSales),
      cashOutTotal: paymentSum(docsPurchases),
      stockQty: prod.reduce((s, p) => s + Number(p.quantite || 0), 0),
      openDocs: [...docsSales, ...docsPurchases].filter(d => d.stage !== 'facture' && docStatus(d) !== 'closed').length,
      paidRate: paidRate([...docsSales, ...docsPurchases]),
      lowMargin: prod.filter(p => productProfitStatus(p) !== 'healthy').length,
      clientsCount: (clients || []).length,
      suppliersCount: (suppliers || []).length,
      expiryAlerts,
      overdueInvoices,
      myTripsCount: myTrips.length,
      myChargesTotal,
      myTripNetMargin
    }
  };
}


function jsonValue(v, fallback) {
  if (!v) return fallback;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return fallback; }
  }
  return v;
}

function paymentInfo(doc) {
  const payments = jsonValue(doc.payments_json || doc.paiements, []);
  const activePayments = payments.filter(p => !p.canceled);
  const paid = activePayments.reduce((s, p) => s + Number(p.montant || 0), 0);
  const total = Number(doc.total_ttc || doc.totalTTC || 0);
  const rest = Math.max(0, total - paid);
  const status = paid <= 0.001 ? 'unpaid' : rest <= 0.01 ? 'paid' : 'partial';
  return { paid, rest, status };
}

function mapProduct(p) {
  return {
    id: p.id,
    ref: p.ref || '',
    nom: p.name || '',
    nomAr: p.name_ar || '',
    categorie: p.category || '',
    unite: p.unit || '',
    prixAchat: Number(p.purchase_price || 0),
    prixVente: Number(p.sale_price || 0),
    prixGros: Number(p.sale_price_wholesale || 0),
    barcode: p.barcode || '',
    quantite: Number(p.quantity || 0),
    stockMin: Number(p.min_stock || 0),
    datePeremption: p.date_expiration || '',
    fournisseurId: p.supplier_id,
    branchId: p.branch_id || null,
    branchName: p.branches?.name || ''
  };
}

function mapDoc(d) {
  const pay = paymentInfo(d);
  return {
    ...d,
    numeros: jsonValue(d.numbers_json, {}),
    lignes: jsonValue(d.lines_json, []),
    paiements: jsonValue(d.payments_json, []),
    totalTTC: Number(d.total_ttc || 0),
    totalHT: Number(d.total_ht || 0),
    tva: Number(d.vat || 0),
    reste: pay.rest,
    statutPaiement: pay.status,
    baseDocId: d.base_doc_id || null,
    qtyDone: Number(d.qty_done || 0),
    qtyStatus: docStatus(d),
    qtyRemaining: docRemainingQty(d)
  };
}

/* ---------- Remises, tarifs et sens des documents ---------- */
function lineDiscount(l) {
  return Math.min(100, Math.max(0, Number(l?.remise || 0)));
}
function lineGross(l) {
  return Number(l?.prixUnit || 0) * Number(l?.qte || 0);
}
function lineNet(l) {
  return lineGross(l) * (1 - lineDiscount(l) / 100);
}
// Avoir client / retour fournisseur = montant négatif dans les cumuls
function isReturnDoc(doc) {
  return doc?.stage === 'avoir' || doc?.stage === 'retour';
}
function docSign(doc) {
  return isReturnDoc(doc) ? -1 : 1;
}
// Montant comptant pour le chiffre d'affaires / volume d'achats : factures (+) et avoirs/retours (−)
function revenueTTC(doc) {
  if (doc?.stage === 'facture') return Number(doc.totalTTC ?? doc.total_ttc ?? 0);
  if (isReturnDoc(doc)) return -Number(doc.totalTTC ?? doc.total_ttc ?? 0);
  return 0;
}
// Prix proposé selon le type de client (détail / gros)
function priceForParty(product, party, isSales) {
  if (!product) return 0;
  if (!isSales) return Number(product.prixAchat || 0);
  if (party?.price_tier === 'gros' && Number(product.prixGros || 0) > 0) return Number(product.prixGros);
  return Number(product.prixVente || 0);
}

function computeTotals(lines, vatRate, salesMode) {
  const base = lines.reduce((s, l) => s + lineNet(l), 0);
  if (salesMode) {
    const totalTTC = base;
    const totalHT = totalTTC / (1 + vatRate / 100);
    return { totalHT, vat: totalTTC - totalHT, totalTTC };
  }
  const totalHT = base;
  return { totalHT, vat: totalHT * vatRate / 100, totalTTC: totalHT * (1 + vatRate / 100) };
}

async function nextNumber(prefix) {
  if (await isSecureBackend()) {
    const { data, error } = await supabase.rpc('app_next_number', { p_prefix: prefix });
    if (error) throw rpcError(error);
    return data;
  }
  const { data } = await supabase.from('counters').select('value').eq('name', prefix).maybeSingle();
  const value = Number(data?.value || 1);
  const { error } = await supabase.from('counters').upsert({ name: prefix, value: value + 1 }, { onConflict: 'name' });
  if (error) throw new Error(error.message);
  return prefix + '-' + new Date().getFullYear() + '-' + String(value).padStart(4, '0');
}


async function updateStock(lines, sign, reason, meta = {}) {
  const session = getStoredSession();
  const stockLines = (lines || []).map(l => ({
    ...l,
    produitId: Number(l.produitId || l.product_id || l.id),
    qte: Number(l.qte ?? l.quantity ?? 0)
  })).filter(l => l.produitId && Number(l.qte || 0) !== 0);

  // V48 : chaque mouvement est fait par la base en une seule opération verrouillée (aucune vente perdue)
  if (await isSecureBackend()) {
    for (const line of stockLines) {
      const qty = Math.abs(Number(line.qte || 0));
      const lineCost = meta.useLinePrice ? Number(line.prixUnit || 0) : (line.cout !== undefined && line.cout !== '' && line.cout !== null ? Number(line.cout) : null);
      const { error } = await supabase.rpc('app_stock_move', {
        p_product_id: Number(line.produitId),
        p_qty: qty * sign,
        p_cost: lineCost,
        p_reverse_cost: !!meta.useLinePrice && sign < 0,
        p_reason: reason,
        p_doc_type: meta.docType || null,
        p_doc_number: meta.docNumber || null
      });
      if (error) throw rpcError(error);
    }
    await auditLog('Stock', 'STOCK', meta.docNumber || reason, reason);
    return;
  }

  for (const line of stockLines) {
    const productId = Number(line.produitId || line.product_id || line.id);
    const rawQty = Number(line.qte || line.quantity || 0);
    const movementQty = rawQty * sign;
    const qty = Math.abs(movementQty);
    if (!productId || !qty) continue;

    const { data: product, error: readError } = await supabase
      .from('products')
      .select('quantity, branch_id, purchase_price, name')
      .eq('id', productId)
      .single();

    if (readError) throw new Error(readError.message);

    if (!isAdmin(session) && Number(product.branch_id || 0) !== Number(branchId(session) || 0)) {
      throw new Error('Mouvement stock refusé : produit hors droguerie utilisateur');
    }

    const oldQty = Number(product.quantity || 0);
    const newQty = oldQty + movementQty;
    if (newQty < -0.0001) {
      throw new Error('Stock insuffisant pour le produit : ' + (product.name || productId) + ' (en stock : ' + fmt(oldQty) + ', demandé : ' + fmt(qty) + ')');
    }

    // Prix moyen pondéré (PMP) : recalculé à chaque entrée valorisée.
    // - entrée achat : coût = prix unitaire HT de la ligne (meta.useLinePrice)
    // - entrée manuelle : coût saisi (line.cout), sinon PMP inchangé
    // - annulation d'une entrée achat : on retire la valeur entrée au même coût
    const stockUpdate = { quantity: Math.max(0, Number(newQty.toFixed(4))) };
    const oldPmp = Number(product.purchase_price || 0);
    const lineCost = meta.useLinePrice ? Number(line.prixUnit || 0) : (line.cout !== undefined && line.cout !== '' && line.cout !== null ? Number(line.cout) : null);
    if (sign > 0 && lineCost !== null && lineCost > 0) {
      const base = Math.max(0, oldQty);
      stockUpdate.purchase_price = Number(((base * oldPmp + qty * lineCost) / (base + qty)).toFixed(4));
    } else if (sign < 0 && meta.useLinePrice && lineCost > 0 && newQty > 0.0001) {
      const pmp = (oldQty * oldPmp - qty * lineCost) / newQty;
      if (pmp > 0) stockUpdate.purchase_price = Number(pmp.toFixed(4));
    }

    const { error: updateError } = await supabase.from('products').update(stockUpdate).eq('id', productId);
    if (updateError) throw new Error(updateError.message);

    const movement = {
      product_id: productId,
      quantity: movementQty,
      reason,
      branch_id: product.branch_id || branchId(session) || null,
      created_at: new Date().toISOString()
    };

    if (meta.docType) movement.doc_type = meta.docType;
    if (meta.docNumber) movement.doc_number = meta.docNumber;
    if (session?.user?.id) movement.user_id = session.user.id;
    if (session?.user) movement.user_label = currentUserLabel();

    await supabase.from('stock_movements').insert(movement);
  }
  await auditLog('Stock', 'STOCK', meta.docNumber || reason, reason);
}

async function login(username, password) {
  if (await isSecureBackend()) {
    const { data, error } = await supabase.rpc('app_login', { p_username: username, p_password: password, p_user_agent: (navigator.userAgent || '').slice(0, 200) });
    if (error) throw new Error(/mot de passe/i.test(error.message) ? 'Mot de passe incorrect' : 'Identifiant incorrect');
    return { token: data.token, user: data.user, perms: data.perms || [] };
  }
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, password_hash, active, branch_id, branches(name), roles(name)')
    .eq('username', username)
    .eq('active', true)
    .single();

  if (error || !data) throw new Error('Identifiant incorrect');
  if (password !== data.password_hash) throw new Error('Mot de passe incorrect');

  const userPerms = await getUserPermissions(data.id);

  return {
    user: {
      id: data.id,
      username: data.username,
      full_name: data.full_name,
      role: data.roles?.name || 'Sans profil',
      branch_id: data.branch_id || null,
      branch_name: data.branches?.name || ''
    },
    perms: userPerms
  };
}

function App() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');
  const [session, setSession] = useState(getStoredSession());
  const L = key => TXT[lang]?.[key] || key;

  // V48 : au démarrage puis toutes les 10 minutes, on vérifie que la session est toujours valide
  useEffect(() => {
    if (!session) return undefined;
    let stop = false;
    const verify = async () => {
      const valid = await checkSessionStillValid();
      if (!valid && !stop) { clearStoredSession(); setSession(null); }
    };
    verify();
    const t = setInterval(verify, 10 * 60 * 1000);
    return () => { stop = true; clearInterval(t); };
  }, [session?.token, session?.user?.id]);

  function toggleLang() {
    const next = lang === 'fr' ? 'ar' : 'fr';
    localStorage.setItem('lang', next);
    setLang(next);
  }

  if (!supabaseUrl || !supabaseKey) {
    return <ConfigMissing />;
  }

  if (!session) {
    return <LoginPage L={L} lang={lang} onLogin={async s => { setStoredSession(s); await refreshSaasModulesCache(); setSession(s); }} />;
  }

  return <><InstallPrompt /><Layout L={L} lang={lang} toggleLang={toggleLang} session={session} setSession={setSession} /></>;
}


async function refreshCurrentSession(setSession) {
  const current = getStoredSession();
  if (!current?.user?.id) return;
  const perms = await getUserPermissions(current.user.id);
  const updated = { ...current, perms };
  setStoredSession(updated);
  setSession(updated);
}



function isSuperAdmin(session) {
  return session?.user?.role === 'SuperAdmin' || session?.user?.role === 'Super Administrateur';
}

function isSystemAdmin(session) {
  return isSuperAdmin(session) || isAdmin(session);
}


// Module de l'abonnement SaaS actif ?
function moduleOn(code) {
  return !getDisabledModulesCache().includes(code);
}

function getDisabledModulesCache() {
  return jsonValue(localStorage.getItem('droguerie_disabled_modules'), []);
}

function isPlatformPage(page) {
  return ['saas', 'backup', 'settings', 'permissions', 'users', 'branches', 'mobileApp'].includes(page);
}

function isBusinessPage(page) {
  return ['dashboard', 'profit', 'reporting', 'tools', 'pos', 'products', 'sales', 'purchases', 'payments', 'stockMoves', 'clients', 'suppliers'].includes(page);
}


function canSeeRoleColumn(role, session = getStoredSession()) {
  if (isSuperAdmin(session)) return true;
  return !['SuperAdmin', 'Super Administrateur'].includes(role?.name);
}

function canSeePermissionRow(permission, session = getStoredSession()) {
  if (isSuperAdmin(session)) return true;
  return !isSaasPermission(permission?.code);
}

function isSaasPermission(code) {
  return ['superadmin.manage', 'modules.manage', 'database.manage', 'tenants.manage'].includes(code || '')
    || String(code || '').startsWith('superadmin.')
    || String(code || '').startsWith('modules.')
    || String(code || '').startsWith('database.')
    || String(code || '').startsWith('tenants.');
}




function getSelectedUserFilter(scope = 'docs') {
  return localStorage.getItem('droguerie_user_filter_' + scope) || 'all';
}

function setSelectedUserFilter(scope, value) {
  localStorage.setItem('droguerie_user_filter_' + scope, value || 'all');
  window.dispatchEvent(new CustomEvent('droguerie_user_filter_changed', { detail: { scope, value: value || 'all' } }));
}

function applyUserFilterToRows(rows, scope = 'docs') {
  const v = getSelectedUserFilter(scope);
  if (!v || v === 'all') return rows || [];
  return (rows || []).filter(x => Number(x.created_by || x.createdBy || x.user_id || 0) === Number(v));
}

function UserFilter({ L, scope = 'docs', value, onChange }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  return (
    <div className="branch-filter-card no-print">
      <span>{L('userFilter')}</span>
      <select className="input" value={value} onChange={e => onChange(e.target.value)}>
        <option value="all">{L('allUsers')}</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
      </select>
    </div>
  );
}

function groupByCreator(docs, usersMap = {}) {
  const map = {};
  (docs || []).forEach(d => {
    const id = d.created_by || d.createdBy || 0;
    const name = usersMap[id] || d.createdByLabel || d.user_label || (id ? ('User #' + id) : '-');
    if (!map[id]) map[id] = { id, name, docs: 0, total: 0, paid: 0, debt: 0, margin: 0, invoices: 0 };
    map[id].docs += 1;
    map[id].total += revenueTTC(d);
    if (d.stage === 'facture') {
      map[id].paid += Number(d.totalTTC || 0) - Number(d.reste || 0);
      map[id].debt += Number(d.reste || 0);
      map[id].invoices += 1;
    }
    if (d.stage === 'facture' || isReturnDoc(d)) map[id].margin += documentProfit(d).margin || 0;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

function groupDebtBySeller(docs, usersMap = {}) {
  return groupByCreator((docs || []).filter(d => d.stage === 'facture' && Number(d.reste || 0) > 0.01), usersMap)
    .sort((a, b) => b.debt - a.debt);
}

function reportSuggestionItems(L) {
  return [
    L('salesBySeller') + ' : analyse CA, factures et encaissements par vendeur.',
    L('debtBySeller') + ' : suivi des impayés par vendeur pour recouvrement.',
    L('marginBySeller') + ' : marge commerciale estimée par vendeur.',
    'Top clients par chiffre d’affaires et par encours.',
    'Produits les plus vendus et produits à faible rotation.',
    'Comparatif ventes / achats / marge par droguerie.',
    'Balance âgée clients et fournisseurs avec alertes +90 jours.',
    'Performance recouvrement : montant facturé vs encaissé.'
  ];
}

function getSelectedBranchFilter() {
  return localStorage.getItem('droguerie_branch_filter') || 'all';
}

function setSelectedBranchFilter(value) {
  localStorage.setItem('droguerie_branch_filter', value || 'all');
  window.dispatchEvent(new CustomEvent('droguerie_branch_filter_changed', { detail: value || 'all' }));
}

function shouldApplyBranchFilter(session = getStoredSession()) {
  return isAdmin(session) || isSuperAdmin(session);
}

function selectedBranchId(session = getStoredSession()) {
  if (!shouldApplyBranchFilter(session)) return branchId(session);
  if (!moduleOn('branches')) return null;
  const v = getSelectedBranchFilter();
  if (!v || v === 'all') return null;
  return Number(v);
}

function applyBranchFilterToQuery(query, session = getStoredSession()) {
  const bid = selectedBranchId(session);
  return bid ? query.eq('branch_id', bid) : query;
}

function filterRowsBySelectedBranch(rows, field = 'branch_id', session = getStoredSession()) {
  const bid = selectedBranchId(session);
  if (!bid) return rows || [];
  return (rows || []).filter(x => Number(x?.[field] || x?.branchId || 0) === Number(bid));
}

function BranchFilter({ L, value, onChange }) {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    loadBranches().then(setBranches).catch(() => setBranches([]));
  }, []);

  if (!shouldApplyBranchFilter(getStoredSession()) || !moduleOn('branches')) return null;

  return (
    <div className="branch-filter-card no-print">
      <span>{L('branchFilter')}</span>
      <select className="input" value={value} onChange={e => onChange(e.target.value)}>
        <option value="all">{L('allBranches')}</option>
        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
    </div>
  );
}

function moduleCodeForPage(page) {
  return {
    dashboard: 'dashboard',
    profit: 'profit',
    reporting: 'reporting',
    tools: 'tools',
    products: 'products',
    sales: 'sales',
    pos: 'pos',
    purchases: 'purchases',
    payments: 'payments',
    stockMoves: 'stockMoves',
    clients: 'clients',
    suppliers: 'suppliers',
    expenses: 'expenses',
    mobileApp: 'mobileApp',
    saas: 'saas',
    backup: 'backup',
    settings: 'settings',
    permissions: 'permissions',
    users: 'users',
    branches: 'branches'
  }[page] || page;
}

async function refreshFeaturesCache() {
  try {
    const { data: v49 } = await supabase.from('permissions').select('id').eq('code', 'cash.close').maybeSingle();
    localStorage.setItem('droguerie_perm_v49', v49 ? '1' : '0');
  } catch {}
  try {
    const { data, error } = await supabase.from('app_settings').select('value').eq('key', 'features_off').maybeSingle();
    if (error) throw error;
    const off = jsonValue(data?.value, []);
    localStorage.setItem('droguerie_features_off', JSON.stringify(Array.isArray(off) ? off : []));
  } catch (e) {
    console.warn('refreshFeaturesCache:', e.message);
  }
  return getFeaturesOff();
}

async function saveFeaturesOff(list) {
  requirePerm('settings.manage', 'Gestion des fonctions');
  const value = JSON.stringify([...new Set(list)]);
  const { error } = await supabase.from('app_settings').upsert({ key: 'features_off', value }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
  localStorage.setItem('droguerie_features_off', value);
  await auditLog('Paramètres', 'UPDATE', 'Fonctions activées', value);
  window.dispatchEvent(new CustomEvent('droguerie_modules_changed', { detail: getDisabledModulesCache() }));
}

async function refreshSaasModulesCache() {
  await refreshFeaturesCache();
  try {
    const { data, error } = await supabase.from('saas_modules').select('code, enabled');
    if (error) throw error;
    const disabled = (data || []).filter(x => x.enabled === false).map(x => x.code);
    localStorage.setItem('droguerie_disabled_modules', JSON.stringify(disabled));
    return disabled;
  } catch (e) {
    console.warn('refreshSaasModulesCache:', e.message);
    return getDisabledModulesCache();
  }
}

function visibleMenuItem(item, session, disabledModules = getDisabledModulesCache()) {
  const page = item[0];
  const perm = item[2];
  if (!hasPerm(session, perm)) return false;

  const moduleCode = moduleCodeForPage(page);

  if (isSuperAdmin(session)) {
    return ['saas', 'backup', 'settings', 'permissions', 'users', 'branches', 'mobileApp'].includes(page);
  }

  if (page === 'saas') return false;
  const feature = { pos: 'pos', expenses: 'expenses', profit: 'profit', tools: 'tools' }[page];
  if (feature && getFeaturesOff().includes(feature)) return false;
  return !disabledModules.includes(moduleCode);
}


function isSuperAdminUserRow(userRow) {
  const roleName = userRow?.roles?.name || userRow?.role || '';
  return roleName === 'SuperAdmin' || roleName === 'Super Administrateur';
}


function hasModuleAccess(code) {
  const session = getStoredSession();
  const page = moduleCodeForPage(code);
  if (isSuperAdmin(session) && isPlatformPage(page)) return true;
  const disabled = getDisabledModulesCache();
  return !disabled.includes(page);
}


async function loadSaasModules() {
  const { data, error } = await supabase.from('saas_modules').select('*').order('sort_order').order('code');
  if (error) {
    console.warn('loadSaasModules:', error.message);
    return [];
  }
  return data || [];
}

async function saveSaasModule(row) {
  requirePerm('modules.manage', 'Gestion modules');
  const payload = {
    code: row.code,
    name: row.name || row.code,
    description: row.description || '',
    enabled: row.enabled !== false,
    monthly_price: Number(row.monthly_price || 0),
    yearly_price: Number(row.yearly_price || 0),
    sort_order: Number(row.sort_order || 0)
  };
  const { error } = await supabase.from('saas_modules').upsert(payload, { onConflict: 'code' });
  if (error) throw new Error(error.message);
}

async function loadDbStats() {
  const tables = ['products', 'clients', 'suppliers', 'sales', 'purchases', 'users', 'branches', 'stock_movements', 'payments', 'app_settings'];
  const results = [];
  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      results.push({ table: t, count: error ? 'N/A' : count });
    } catch {
      results.push({ table: t, count: 'N/A' });
    }
  }
  return results;
}

function isAdmin(session) {
  return session?.user?.role === 'Administrateur' || isSuperAdmin(session);
}

function isManager(session) {
  return session?.user?.role === 'Gérant';
}

function isSeller(session) {
  return session?.user?.role === 'Vendeur';
}

function isStoreKeeper(session) {
  return session?.user?.role === 'Magasinier';
}

function branchId(session) {
  return session?.user?.branch_id || null;
}

function applyDocScope(query, type, session) {
  if (isAdmin(session) || isSuperAdmin(session)) {
    return applyBranchFilterToQuery(query, session);
  }

  // V49 : « voir toute la droguerie » est un droit (sales.all / purchases.all), sinon l'utilisateur voit ses documents
  if (hasPerm(session, type === 'purchases' ? 'purchases.all' : 'sales.all')) {
    return branchId(session) ? query.eq('branch_id', branchId(session)) : query.eq('branch_id', -1);
  }

  return query.eq('created_by', session.user.id);
}


function applyProductScope(query, session) {
  if (isAdmin(session) || isSuperAdmin(session)) {
    return applyBranchFilterToQuery(query, session);
  }
  if (branchId(session)) return query.eq('branch_id', branchId(session));
  return query.eq('branch_id', -1);
}


async function loadBranches() {
  const { data, error } = await supabase.from('branches').select('*').order('name');
  if (error) throw new Error(error.message);
  return data || [];
}



async function saveBranch(branch) {
  const payload = {
    name: branch.name || '',
    city: branch.city || '',
    address: branch.address || '',
    phone: branch.phone || '',
    manager_name: branch.manager_name || '',
    active: branch.active !== false
  };

  const q = branch.id
    ? supabase.from('branches').update(payload).eq('id', branch.id)
    : supabase.from('branches').insert(payload);

  const { error } = await q;
  if (error) throw new Error(error.message);
}

async function deleteBranch(id) {
  const { error } = await supabase.from('branches').update({ active: false }).eq('id', id);
  if (error) throw new Error(error.message);
}

async function loadUsersForBranch() {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, branch_id, roles(name)')
    .order('full_name');

  if (error) throw new Error(error.message);
  return data || [];
}

async function assignUserBranch(userId, branchId) {
  const { error } = await supabase
    .from('users')
    .update({ branch_id: branchId || null })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}




async function loadUserLabels() {
  const { data, error } = await supabase.from('users').select('id, username, full_name');
  if (error) return {};
  const map = {};
  (data || []).forEach(u => {
    map[u.id] = u.full_name || u.username || ('User #' + u.id);
  });
  return map;
}

function enrichDocs(docs, userLabels = {}) {
  const mapped = (docs || []).map(mapDoc);
  const byId = {};
  mapped.forEach(d => { byId[d.id] = d; });

  return mapped.map(d => {
    const base = d.baseDocId ? byId[d.baseDocId] : null;
    return {
      ...d,
      createdByLabel: userLabels[d.created_by] || d.created_by_label || d.user_label || (d.created_by ? ('User #' + d.created_by) : '-'),
      baseDocNumber: base ? docNo(base) : (d.base_doc_number || '')
    };
  });
}

function currentUserLabel() {
  const s = getStoredSession();
  return s?.user?.full_name || s?.user?.username || 'system';
}

async function auditLog(moduleName, action, objectLabel, detail) {
  try {
    const s = getStoredSession();
    await supabase.from('audit_logs').insert({
      module: moduleName,
      action,
      object_label: String(objectLabel || ''),
      detail: String(detail || ''),
      user_id: s?.user?.id || null,
      user_label: currentUserLabel(),
      branch_id: s?.user?.branch_id || null,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Audit log error:', e.message);
  }
}

async function loadAuditLogs() {
  const session = getStoredSession();
  let q = supabase
    .from('audit_logs')
    .select('id, module, action, object_label, detail, user_id, user_label, branch_id, created_at, branches(name)')
    .order('created_at', { ascending: false })
    .limit(500);

  if (!isAdmin(session) && branchId(session)) q = q.eq('branch_id', branchId(session));

  const { data, error } = await q;
  if (error) {
    console.warn('Audit load error:', error.message);
    return [];
  }

  return data || [];
}

async function loadStockMovements() {
  const session = getStoredSession();
  let q = supabase
    .from('stock_movements')
    .select('id, product_id, quantity, reason, created_at, user_label, doc_type, doc_number, branch_id, products(ref, name, branch_id), branches(name)')
    .order('created_at', { ascending: false });

  if (isAdmin(session) || isSuperAdmin(session)) {
    q = applyBranchFilterToQuery(q, session);
  } else if (branchId(session)) {
    q = q.eq('branch_id', branchId(session));
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  return (data || []).map(m => ({
    id: m.id,
    ref: m.products?.ref || '',
    productName: m.products?.name || '',
    quantity: Number(m.quantity || 0),
    reason: m.reason || '',
    date: m.created_at,
    userLabel: m.user_label || '',
    docType: m.doc_type || '',
    docNumber: m.doc_number || '',
    branchName: m.branches?.name || ''
  }));
}


function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
  }

  if (!show) return null;

  return (
    <div className="install-banner no-print">
      <div>
        <b>Installer DrogueriePro</b>
        <p>Ajoute l’application à l’écran d’accueil de ton téléphone.</p>
      </div>
      <button className="btn bg-amber-500" onClick={install}>Installer</button>
      <button className="btn bg-white border" onClick={() => setShow(false)}>Plus tard</button>
    </div>
  );
}


function ConfigMissing() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 p-6">
      <div className="card p-6 max-w-xl">
        <h1 className="text-xl font-bold text-red-600 mb-3">Configuration Supabase manquante</h1>
        <p>Ajoute VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans Vercel, puis redéploie.</p>
      </div>
    </div>
  );
}


async function getVatRate() {
  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'vat_rate').maybeSingle();
    return Number(data?.value || 20);
  } catch { return 20; }
}

/* ---------- Alertes paramétrables (stockées dans app_settings, mises en cache local) ---------- */
const ALERT_DEFAULTS = {
  alert_stock_enabled: '1',
  alert_expiry_enabled: '1', alert_expiry_days: '30',
  alert_unpaid_enabled: '1', alert_unpaid_days: '30',
  alert_margin_enabled: '1', alert_margin_min: '10'
};

function cacheAlertSettings(settings) {
  const o = {};
  Object.keys(ALERT_DEFAULTS).forEach(k => { if (settings && settings[k] !== undefined) o[k] = settings[k]; });
  try { localStorage.setItem('droguerie_alert_settings', JSON.stringify(o)); } catch {}
}

function getAlertSettings() {
  let c = {};
  try { c = JSON.parse(localStorage.getItem('droguerie_alert_settings') || '{}') || {}; } catch {}
  const s = { ...ALERT_DEFAULTS, ...c };
  return {
    stock: s.alert_stock_enabled !== '0',
    expiry: s.alert_expiry_enabled !== '0',
    expiryDays: Math.max(0, Number(s.alert_expiry_days || 30)),
    unpaid: s.alert_unpaid_enabled !== '0',
    unpaidDays: Math.max(0, Number(s.alert_unpaid_days || 30)),
    margin: s.alert_margin_enabled !== '0',
    marginMin: Math.max(0, Number(s.alert_margin_min || 10))
  };
}

function isLowStockAlert(p) {
  return getAlertSettings().stock && Number(p.quantite || 0) <= Number(p.stockMin || 0);
}

function isExpiryAlert(p) {
  const a = getAlertSettings();
  return a.expiry && !!p.datePeremption && new Date(p.datePeremption) <= new Date(Date.now() + a.expiryDays * 864e5);
}

function isOverdueInvoice(d) {
  const a = getAlertSettings();
  if (!a.unpaid || d.stage !== 'facture' || Number(d.reste || 0) <= 0.01) return false;
  const days = (Date.now() - new Date(d.date || today()).getTime()) / 864e5;
  return days > a.unpaidDays;
}

/* ---------- Catégories & unités produits ---------- */
const DEFAULT_CATEGORIES = ['Peinture', 'Solvants', 'Colles & Silicones', 'Ciment & Plâtre', 'Outillage', 'Droguerie', 'Hygiène', 'Divers'];
const DEFAULT_UNITS = ['Pièce', 'Kg', 'Litre', 'Sac', 'Bidon', 'Carton', 'Mètre', 'm²', 'Paire', 'Rouleau'];

async function loadProductLists() {
  const out = {
    categories: DEFAULT_CATEGORIES.map(name => ({ id: null, name })),
    units: DEFAULT_UNITS.map(name => ({ id: null, name })),
    dbReady: false
  };
  try {
    const [c, u] = await Promise.all([
      supabase.from('product_categories').select('*').order('name'),
      supabase.from('product_units').select('*').order('name')
    ]);
    if (!c.error && !u.error) {
      out.categories = c.data || [];
      out.units = u.data || [];
      out.dbReady = true;
    }
  } catch {}
  return out;
}

function productListTable(kind) {
  return kind === 'category' ? 'product_categories' : 'product_units';
}

async function addProductListItem(kind, name, nameAr = '') {
  requirePerm('products.write', 'Gestion catégories / unités');
  const clean = String(name || '').trim();
  if (!clean) throw new Error('Nom obligatoire');
  const payload = kind === 'category' ? { name: clean, name_ar: String(nameAr || '').trim() } : { name: clean };
  const { error } = await supabase.from(productListTable(kind)).insert(payload);
  if (error) {
    if (error.code === '42P01' || /does not exist/i.test(error.message)) throw new Error('Table ' + productListTable(kind) + ' absente : exécutez le script SQL de mise à jour.');
    if (error.code === '23505') throw new Error('« ' + clean + ' » existe déjà');
    throw new Error(error.message);
  }
  await auditLog('Produits', 'CREATE', clean, kind === 'category' ? 'Ajout catégorie' : 'Ajout unité');
}

async function deleteProductListItem(kind, item) {
  requirePerm('products.write', 'Gestion catégories / unités');
  if (!item?.id) throw new Error('Élément par défaut : exécutez le script SQL de mise à jour pour gérer les listes.');
  const { error } = await supabase.from(productListTable(kind)).delete().eq('id', item.id);
  if (error) throw new Error(error.message);
  await auditLog('Produits', 'DELETE', item.name, kind === 'category' ? 'Suppression catégorie' : 'Suppression unité');
}

async function loadSettings() {
  const defaults = { vat_rate: '20', theme: 'light', company_name: 'DrogueriePro', company_ice: '', company_phone: '', company_address: '', company_rc: '', company_if: '', company_patente: '', company_cnss: '', ...ALERT_DEFAULTS };
  const { data, error } = await supabase.from('app_settings').select('*');
  if (error) return defaults;
  const out = { ...defaults };
  (data || []).forEach(x => { out[x.key] = x.value; });
  cacheAlertSettings(out);
  return out;
}

async function saveSettings(settings) {
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value: String(value ?? '') }));
  const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'key' });
  if (error) throw new Error(error.message);
  cacheAlertSettings(settings);
}


async function loadRoles() {
  const session = getStoredSession();
  let q = supabase.from('roles').select('*').order('id');
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const rows = data || [];
  if (isSuperAdmin(session)) return rows;
  return rows.filter(r => !['SuperAdmin', 'Super Administrateur'].includes(r.name));
}

async function loadPermissionsMatrix() {
  const session = getStoredSession();
  const [{ data: roles, error: rErr }, { data: permissions, error: pErr }, { data: rolePerms, error: rpErr }] = await Promise.all([
    supabase.from('roles').select('*').order('id'),
    supabase.from('permissions').select('*').order('module').order('code'),
    supabase.from('role_permissions').select('*')
  ]);

  if (rErr) throw new Error(rErr.message);
  if (pErr) throw new Error(pErr.message);
  if (rpErr) throw new Error(rpErr.message);

  const visibleRoles = (roles || []).filter(r => canSeeRoleColumn(r, session));
  const visiblePermissions = (permissions || []).filter(p => canSeePermissionRow(p, session));
  const roleIds = new Set(visibleRoles.map(r => Number(r.id)));
  const permIds = new Set(visiblePermissions.map(p => Number(p.id)));

  const { data: users } = await supabase.from('users').select('id, username, full_name, role_id, active');
  return {
    roles: visibleRoles,
    permissions: visiblePermissions,
    rolePerms: (rolePerms || []).filter(x => roleIds.has(Number(x.role_id)) && permIds.has(Number(x.permission_id))),
    users: (users || []).filter(u => u.active !== false)
  };
}

// V49 : enregistrement groupé des droits d'un profil (ajouts + retraits)
async function saveRolePermissions(role, before, after, idByCode) {
  requirePerm('permissions.manage', 'Gestion des autorisations');
  const session = getStoredSession();
  if (!isSuperAdmin(session) && !canSeeRoleColumn(role, session)) throw new Error('Action non autorisée sur les droits SuperAdmin');
  const add = [...after].filter(c => !before.has(c) && idByCode[c] && (isSuperAdmin(session) || !isSaasPermission(c)));
  const del = [...before].filter(c => !after.has(c) && idByCode[c] && (isSuperAdmin(session) || !isSaasPermission(c)));
  if (add.length) {
    const { error } = await supabase.from('role_permissions').upsert(add.map(c => ({ role_id: role.id, permission_id: idByCode[c] })), { onConflict: 'role_id,permission_id' });
    if (error) throw new Error(error.message);
  }
  if (del.length) {
    const { error } = await supabase.from('role_permissions').delete().eq('role_id', role.id).in('permission_id', del.map(c => idByCode[c]));
    if (error) throw new Error(error.message);
  }
  if (add.length || del.length) await auditLog('Autorisations', 'UPDATE', 'Profil ' + role.name, (add.length ? '+ ' + add.join(', ') : '') + (add.length && del.length ? ' | ' : '') + (del.length ? '- ' + del.join(', ') : ''));
}

async function createRole({ name, description }) {
  requirePerm('permissions.manage', 'Gestion des autorisations');
  if (['SuperAdmin', 'Super Administrateur'].includes(name)) throw new Error('Nom réservé');
  const { data, error } = await supabase.from('roles').insert({ name, description }).select().single();
  if (error) throw new Error(/duplicate|unique/i.test(error.message) ? 'Ce nom de profil existe déjà' : error.message);
  await auditLog('Autorisations', 'CREATE', 'Profil ' + name, description || '');
  return data;
}

async function updateRole(id, { name, description }) {
  requirePerm('permissions.manage', 'Gestion des autorisations');
  const { error } = await supabase.from('roles').update({ name, description }).eq('id', id);
  if (error) throw new Error(/duplicate|unique/i.test(error.message) ? 'Ce nom de profil existe déjà' : error.message);
  await auditLog('Autorisations', 'UPDATE', 'Profil ' + name, description || '');
}

async function deleteRole(id) {
  requirePerm('permissions.manage', 'Gestion des autorisations');
  const { count } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role_id', id);
  if (count) throw new Error('Des utilisateurs ont encore ce profil');
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await auditLog('Autorisations', 'DELETE', 'Profil #' + id, '');
}

async function setRolePermission(roleId, permissionId, enabled) {
  const session = getStoredSession();

  const [{ data: role }, { data: permission }] = await Promise.all([
    supabase.from('roles').select('*').eq('id', roleId).maybeSingle(),
    supabase.from('permissions').select('*').eq('id', permissionId).maybeSingle()
  ]);

  if (!isSuperAdmin(session)) {
    if (!canSeeRoleColumn(role, session) || !canSeePermissionRow(permission, session)) {
      throw new Error('Action non autorisée sur les droits SuperAdmin');
    }
  }

  if (enabled) {
    const { error } = await supabase.from('role_permissions').upsert({ role_id: roleId, permission_id: permissionId }, { onConflict: 'role_id,permission_id' });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('role_permissions').delete().eq('role_id', roleId).eq('permission_id', permissionId);
    if (error) throw new Error(error.message);
  }
}





function amountToWordsFr(n) {
  return dh(n);
}

async function loadCompanySettings() {
  const s = await loadSettings();
  return {
    name: s.company_name || 'DrogueriePro',
    ice: s.company_ice || '',
    phone: s.company_phone || '',
    address: s.company_address || '',
    rc: s.company_rc || '',
    ifNumber: s.company_if || '',
    patente: s.company_patente || '',
    cnss: s.company_cnss || ''
  };
}



function activePaymentsFromDocs(docs) {
  return (docs || []).flatMap(d => (d.paiements || jsonValue(d.payments_json, []) || [])
    .filter(p => !p.canceled)
    .map(p => ({ ...p, doc: d })));
}

// Argent réellement encaissé / décaissé (les imputations d'avoir ne sont pas de la trésorerie)
function paymentSum(docs) {
  return activePaymentsFromDocs(docs).filter(p => p.mode !== 'Avoir').reduce((s, p) => s + Number(p.montant || 0), 0);
}

function paidRate(docs) {
  const inv = (docs || []).filter(d => d.stage === 'facture');
  if (!inv.length) return 0;
  return inv.filter(d => d.statutPaiement === 'paid').length / inv.length * 100;
}

function preciseDocTitle(doc, type, L) {
  const stage = doc?.stage || '';
  const isSalesDoc = type === 'sales' || doc?.client_id || doc?.client_name;
  if (isSalesDoc) {
    return {
      devis: L('customerQuote'),
      commande: L('customerOrder'),
      livraison: L('customerDelivery'),
      facture: L('customerInvoice'),
      avoir: L('creditNote')
    }[stage] || L('sales');
  }
  return {
    commande: L('supplierOrder'),
    reception: L('supplierReceipt'),
    facture: L('supplierInvoice'),
    retour: L('supplierReturn')
  }[stage] || L('purchases');
}

function lineProfit(line) {
  const sale = Number(line.prixUnit || 0) * (1 - lineDiscount(line) / 100);
  const purchase = Number(line.prixAchat || line.purchasePrice || 0);
  const qty = Number(line.qte || 0);
  const margin = (sale - purchase) * qty;
  const rate = sale ? ((sale - purchase) / sale) * 100 : 0;
  return { margin, rate };
}

function documentProfit(doc) {
  const lines = doc?.lignes || jsonValue(doc?.lines_json, []);
  const sign = docSign(doc);
  return (lines || []).reduce((acc, l) => {
    const p = lineProfit(l);
    acc.margin += sign * p.margin;
    acc.sales += sign * lineNet(l);
    return acc;
  }, { margin: 0, sales: 0 });
}

function suggestSalePrice(purchasePrice, targetMargin = 25) {
  const cost = Number(purchasePrice || 0);
  const m = Math.min(80, Math.max(1, Number(targetMargin || 25)));
  return cost / (1 - m / 100);
}

function reorderSuggestion(product) {
  const min = Number(product.stockMin || product.min_stock || 0);
  const qty = Number(product.quantite || product.quantity || 0);
  if (qty > min) return 0;
  return Math.max(1, (min * 2) - qty);
}

function productProfitStatus(product) {
  const purchase = Number(product.prixAchat || 0);
  const sale = Number(product.prixVente || 0);
  const rate = sale ? ((sale - purchase) / sale) * 100 : 0;
  const a = getAlertSettings();
  if (!a.margin) return 'healthy';
  if (rate < a.marginMin) return 'critical';
  if (rate < a.marginMin * 2) return 'warning';
  return 'healthy';
}

function docNo(doc, key) {
  const nums = jsonValue(doc.numbers_json || doc.numeros, {});
  if (key && nums[key]) return nums[key];

  const stageKey = {
    devis: 'devis',
    commande: 'commande',
    livraison: 'livraison',
    reception: 'reception',
    facture: 'facture',
    avoir: 'avoir',
    retour: 'retour'
  }[doc.stage];

  if (stageKey && nums[stageKey]) return nums[stageKey];

  const preferred = ['facture', 'livraison', 'reception', 'commande', 'devis'];
  for (const k of preferred) {
    if (nums[k]) return nums[k];
  }

  return Object.values(nums)[0] || ('#' + doc.id);
}

function docQty(lines) {
  return (lines || []).reduce((s, l) => s + Number(l.qte || 0), 0);
}

function docRemainingQty(doc) {
  if (doc && doc.processed_lines_json) {
    return docRemainingQtyByLines(doc);
  }
  const lines = jsonValue(doc.lines_json || doc.lignes, []);
  const total = docQty(lines);
  const done = Number(doc.qty_done || 0);
  return Math.max(0, total - done);
}

function docStatus(doc) {
  if (isReturnDoc(doc)) return 'closed';
  const rem = docRemainingQty(doc);
  if (doc.stage === 'facture') return 'closed';
  if (rem <= 0 && ['livraison', 'reception'].includes(doc.stage)) return 'closed';
  if (Number(doc.qty_done || 0) > 0) return 'partial';
  return 'open';
}

function makePartialLines(doc, qte) {
  const original = jsonValue(doc.lines_json || doc.lignes, []);
  const remaining = docRemainingQty(doc);
  const requested = Math.min(Number(qte || 0), remaining || Number(qte || 0));
  if (!requested || requested <= 0) throw new Error('Quantité partielle invalide');

  const total = docQty(original);
  if (!total) throw new Error('Document sans quantité');

  return original.map(l => {
    const lineQty = Number(l.qte || 0);
    const ratio = lineQty / total;
    return { ...l, qte: Number((requested * ratio).toFixed(4)) };
  }).filter(l => Number(l.qte) > 0);
}

function nextStageAllowed(doc, type) {
  if (type === 'sales') {
    if (doc.stage === 'devis') return 'commande';
    if (doc.stage === 'commande') return 'livraison';
    if (doc.stage === 'livraison') return 'facture';
    return null;
  }

  if (doc.stage === 'commande') return 'reception';
  if (doc.stage === 'reception') return 'facture';
  return null;
}

function canPayDocument(doc) {
  return doc.stage === 'facture';
}

function paymentButtonVisible(doc) {
  return doc.stage === 'facture' && Number(doc.reste || 0) > 0;
}


function docPrefix(type, stage) {
  if (type === 'sales') {
    return { devis: 'DEV', commande: 'CMDV', livraison: 'BLV', facture: 'FACV', avoir: 'AVV' }[stage] || 'DOCV';
  }
  return { commande: 'CMDA', reception: 'BRA', facture: 'FACA', retour: 'RTA' }[stage] || 'DOCA';
}

function docKey(type, stage) {
  if (type === 'sales') {
    return { devis: 'devis', commande: 'commande', livraison: 'livraison', facture: 'facture', avoir: 'avoir' }[stage] || stage;
  }
  return { commande: 'commande', reception: 'reception', facture: 'facture', retour: 'retour' }[stage] || stage;
}

function normalizeLines(lines) {
  return (lines || []).map(l => ({
    ...l,
    produitId: Number(l.produitId || l.product_id || l.id),
    qte: Number(l.qte || l.quantity || 0),
    prixUnit: Number(l.prixUnit || l.unit_price || 0)
  })).filter(l => l.produitId && l.qte > 0);
}


function lineKey(line) {
  return String(line.produitId || line.product_id || line.id || line.ref || line.nom || '');
}

function processedLines(doc) {
  return jsonValue(doc.processed_lines_json, {});
}

function lineProcessedQty(doc, line) {
  const processed = processedLines(doc);
  return Number(processed[lineKey(line)] || 0);
}

function lineRemainingQty(doc, line) {
  return Math.max(0, Number(line.qte || 0) - lineProcessedQty(doc, line));
}

function docRemainingLines(doc) {
  const original = normalizeLines(jsonValue(doc.lines_json || doc.lignes, []));
  return original.map(l => ({
    ...l,
    processedQty: lineProcessedQty(doc, l),
    remainingQty: lineRemainingQty(doc, l)
  }));
}

function docRemainingQtyByLines(doc) {
  return docRemainingLines(doc).reduce((s, l) => s + Number(l.remainingQty || 0), 0);
}

function selectedPartialLines(doc, linesInput, sourceLines) {
  const original = sourceLines || docRemainingLines(doc);
  const input = Array.isArray(linesInput) ? linesInput : [];
  const byKey = {};

  input.forEach(l => {
    const key = lineKey(l);
    if (!key) return;
    byKey[key] = {
      excluded: !!l.excluded,
      qty: Number(l.qteToProcess ?? l.qte ?? 0)
    };
  });

  const result = [];
  for (const line of original) {
    const key = lineKey(line);
    const inputLine = byKey[key];

    // Si la ligne n'existe pas dans le modal, on ne la traite pas.
    if (!inputLine) continue;

    // Ligne retirée volontairement : aucun mouvement.
    if (inputLine.excluded) continue;

    const qty = Number(inputLine.qty || 0);
    if (qty <= 0) continue;

    if (qty > Number(line.remainingQty || 0) + 0.0001) {
      throw new Error('Quantité supérieure au reste pour le produit : ' + (line.nom || line.ref || line.produitId));
    }

    result.push({
      ...line,
      qte: qty,
      processedQty: undefined,
      remainingQty: undefined,
      excluded: undefined,
      qteToProcess: undefined
    });
  }

  if (!result.length) {
    throw new Error('Veuillez saisir au moins une quantité à traiter sur une ligne non retirée');
  }

  return result;
}

function mergeProcessedLines(doc, linesProcessed) {
  const processed = { ...processedLines(doc) };
  normalizeLines(linesProcessed).forEach(l => {
    const k = lineKey(l);
    processed[k] = Number(processed[k] || 0) + Number(l.qte || 0);
  });
  return processed;
}

function processedTotal(processed) {
  return Object.values(processed || {}).reduce((s, v) => s + Number(v || 0), 0);
}


function scaleLinesToQty(lines, qtyToProcess) {
  const total = docQty(lines);
  const qty = Math.min(Number(qtyToProcess || 0), total);
  if (!qty || qty <= 0) throw new Error('Quantité invalide');
  return normalizeLines(lines).map(l => ({
    ...l,
    qte: Number((Number(l.qte || 0) * qty / total).toFixed(4))
  })).filter(l => l.qte > 0);
}

function paymentLabel(doc, L) {
  if (doc.statutPaiement === 'paid') return L('paid');
  if (doc.statutPaiement === 'partial') return L('partial');
  return L('unpaid');
}

function docTypeLabel(doc, type, L) {
  return preciseDocTitle(doc, type, L);
}

function docActionLabel(action) {
  const map = {
    CREATE: 'Création',
    UPDATE: 'Modification',
    DELETE: 'Suppression',
    ADVANCE: 'Avancement document',
    PAYMENT: 'Règlement',
    CANCEL_PAYMENT: 'Annulation règlement',
    STOCK: 'Mouvement stock',
    PARTIAL_DELIVERY: 'Livraison partielle',
    PARTIAL_RECEIPT: 'Réception partielle',
    PARTIAL_INVOICE: 'Facturation partielle',
    CREDIT_NOTE: 'Avoir client',
    SUPPLIER_RETURN: 'Retour fournisseur'
  };
  return map[action] || action || '-';
}





async function partyName(type, id, fallback = '') {
  if (!id) return fallback;
  const table = type === 'sales' ? 'clients' : 'suppliers';
  const { data } = await supabase.from(table).select('name').eq('id', id).maybeSingle();
  return data?.name || fallback;
}

async function createDoc(type, body) {
  requirePerm(type === 'sales' ? 'sales.write' : 'purchases.write', type === 'sales' ? 'Création vente' : 'Création achat');
  const isSales = type === 'sales';
  const start = body.start || (isSales ? 'devis' : 'commande');
  const lines = normalizeLines(body.lignes || []);
  if (!lines.length) throw new Error('Le document doit contenir au moins une ligne');

  // Contrôle du stock disponible = stock - quantités déjà réservées par les commandes clients ouvertes
  if (isSales && ['commande', 'livraison', 'facture'].includes(start)) {
    await assertSalesAvailability(lines, null);
  }

  const vat = Number(body.tauxTva || await getVatRate());
  const t = computeTotals(lines, vat, isSales);
  if (isSales && start === 'facture') {
    await assertCreditLimit(body.clientId, t.totalTTC - Number(body.paidNow || 0), body.forceCredit);
  }
  const prefix = docPrefix(type, start);
  const key = docKey(type, start);
  const docNumber = await nextNumber(prefix);
  const numbers = { [key]: docNumber };
  const session = getStoredSession();
  const qty = docQty(lines);

  const movesStock = isSales
    ? ['livraison', 'facture'].includes(start)
    : ['reception', 'facture'].includes(start);

  if (movesStock) {
    await updateStock(
      lines,
      isSales ? -1 : 1,
      (isSales ? 'Sortie stock ' : 'Entrée stock ') + docNumber,
      { docType: start, docNumber, useLinePrice: !isSales }
    );
  }

  const payload = isSales ? {
    date: body.date || today(),
    client_id: body.clientId || null,
    client_name: body.clientNom || await partyName(type, body.clientId),
    stage: start,
    numbers_json: numbers,
    lines_json: lines,
    payments_json: [],
    vat_rate: vat,
    total_ht: t.totalHT,
    vat: t.vat,
    total_ttc: t.totalTTC,
    delivered: ['livraison', 'facture'].includes(start),
    qty_done: movesStock ? qty : 0,
    processed_lines_json: movesStock ? mergeProcessedLines({ processed_lines_json: {} }, lines) : {},
    doc_status: start === 'facture' ? 'closed' : (movesStock ? 'closed' : 'open'),
    created_by: session?.user?.id || null,
    base_doc_id: body.baseDocId || null,
    branch_id: isAdmin(session) ? (body.branchId || branchId(session)) : branchId(session)
  } : {
    date: body.date || today(),
    supplier_id: body.fournisseurId || null,
    supplier_name: body.fournisseurNom || await partyName(type, body.fournisseurId),
    stage: start,
    numbers_json: numbers,
    lines_json: lines,
    payments_json: [],
    vat_rate: vat,
    total_ht: t.totalHT,
    vat: t.vat,
    total_ttc: t.totalTTC,
    received: ['reception', 'facture'].includes(start),
    qty_done: movesStock ? qty : 0,
    processed_lines_json: movesStock ? mergeProcessedLines({ processed_lines_json: {} }, lines) : {},
    doc_status: start === 'facture' ? 'closed' : (movesStock ? 'closed' : 'open'),
    created_by: session?.user?.id || null,
    base_doc_id: body.baseDocId || null,
    branch_id: isAdmin(session) ? (body.branchId || branchId(session)) : branchId(session)
  };

  const { data: created, error } = await supabase.from(type).insert(payload).select('id').single();
  if (error) throw new Error(error.message);
  await auditLog(isSales ? 'Ventes' : 'Achats', 'CREATE', docNumber, 'Création ' + start);
  return { id: created?.id, number: docNumber, totals: t };
}


/* ===================== Règles stock / réservations / facturation partielle ===================== */

function linesToMap(lines) {
  const m = {};
  normalizeLines(lines).forEach(l => { const k = lineKey(l); m[k] = Number(m[k] || 0) + Number(l.qte || 0); });
  return m;
}

function docMovesStock(doc, type) {
  return type === 'sales'
    ? !!doc.delivered && ['livraison', 'facture'].includes(doc.stage)
    : !!doc.received && ['reception', 'facture'].includes(doc.stage);
}

function invoicedLines(doc) {
  return jsonValue(doc.invoiced_lines_json, {});
}

function docInvoiceRemainingLines(doc) {
  const inv = invoicedLines(doc);
  return normalizeLines(jsonValue(doc.lines_json || doc.lignes, [])).map(l => {
    const done = Number(inv[lineKey(l)] || 0);
    return { ...l, processedQty: done, remainingQty: Math.max(0, Number(l.qte || 0) - done) };
  });
}

function docInvoicedQty(doc) {
  return Object.values(invoicedLines(doc)).reduce((s, v) => s + Number(v || 0), 0);
}

function docInvoiceRemainingQty(doc) {
  return docInvoiceRemainingLines(doc).reduce((s, l) => s + Number(l.remainingQty || 0), 0);
}

// Quantités encore retournables sur une facture (facturé − déjà retourné)
function docReturnRemainingLines(doc) {
  const ret = jsonValue(doc.returned_lines_json, {});
  return normalizeLines(jsonValue(doc.lines_json || doc.lignes, [])).map(l => {
    const done = Number(ret[lineKey(l)] || 0);
    return { ...l, processedQty: done, remainingQty: Math.max(0, Number(l.qte || 0) - done) };
  });
}
function canReturnDoc(doc) {
  return doc.stage === 'facture' && docReturnRemainingLines(doc).some(l => Number(l.remainingQty || 0) > 0);
}

function canPartialInvoice(doc, type) {
  const src = type === 'sales' ? 'livraison' : 'reception';
  return doc.stage === src && docInvoiceRemainingQty(doc) > 0;
}

/* ---------- Plafond de crédit client ---------- */
function canOverrideCreditLimit() {
  return can('sales.credit_override');
}

async function clientOutstanding(clientId) {
  const { data, error } = await supabase.from('sales').select('id, stage, total_ttc, payments_json').eq('client_id', clientId).eq('stage', 'facture');
  if (error) throw new Error(error.message);
  return (data || []).reduce((s, d) => s + Number(paymentInfo(d).rest || 0), 0);
}

async function assertCreditLimit(clientId, addAmount, force) {
  if (!clientId || force || Number(addAmount || 0) <= 0.01) return;
  const { data: c } = await supabase.from('clients').select('name, credit_limit').eq('id', clientId).maybeSingle();
  const limit = Number(c?.credit_limit || 0);
  if (limit <= 0) return; // 0 = pas de plafond
  const out = await clientOutstanding(clientId);
  if (out + Number(addAmount) > limit + 0.01) {
    const e = new Error('Plafond de crédit dépassé pour ' + (c?.name || 'ce client') + ' : encours ' + dh(out) + ' + cette facture ' + dh(addAmount) + ' > plafond ' + dh(limit));
    e.code = 'CREDIT_LIMIT';
    throw e;
  }
}

// Quantités réservées = reste à livrer des commandes clients ouvertes
async function reservedQtyByProduct(excludeDocId) {
  const { data, error } = await supabase.from('sales').select('id, stage, lines_json, processed_lines_json, doc_status').eq('stage', 'commande');
  if (error) throw new Error(error.message);
  const map = {};
  (data || []).forEach(d => {
    if (excludeDocId && String(d.id) === String(excludeDocId)) return;
    docRemainingLines(d).forEach(l => {
      map[l.produitId] = Number(map[l.produitId] || 0) + Number(l.remainingQty || 0);
    });
  });
  return map;
}

async function assertSalesAvailability(lines, excludeDocId) {
  const need = {};
  normalizeLines(lines).forEach(l => { need[l.produitId] = Number(need[l.produitId] || 0) + Number(l.qte || 0); });
  const ids = Object.keys(need).map(Number).filter(Boolean);
  if (!ids.length) return;
  const [{ data: prods, error }, reserved] = await Promise.all([
    supabase.from('products').select('id, name, quantity').in('id', ids),
    reservedQtyByProduct(excludeDocId)
  ]);
  if (error) throw new Error(error.message);
  const problems = [];
  ids.forEach(id => {
    const p = (prods || []).find(x => Number(x.id) === Number(id));
    const stock = Number(p?.quantity || 0);
    const res = Number(reserved[id] || 0);
    const dispo = stock - res;
    if (need[id] > dispo + 0.0001) {
      problems.push('• ' + (p?.name || ('#' + id)) + ' : demandé ' + fmt(need[id]) + ' — stock ' + fmt(stock) + ', réservé (commandes) ' + fmt(res) + ', disponible ' + fmt(Math.max(0, dispo)));
    }
  });
  if (problems.length) {
    throw new Error('Stock disponible insuffisant (les quantités commandées sont réservées) :\n' + problems.join('\n'));
  }
}

async function docHasChildren(type, id) {
  const { data, error } = await supabase.from(type).select('id').eq('base_doc_id', id).limit(1);
  if (error) throw new Error(error.message);
  return (data || []).length > 0;
}

// Ajuste le suivi (livré/reçu ou facturé) du document parent quand un document lié change
async function adjustParentTracking(type, parentId, field, deltaMap) {
  if (!parentId) return;
  const { data: parent, error } = await supabase.from(type).select('*').eq('id', parentId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!parent) return;
  const isProcessed = field === 'processed_lines_json';
  const current = { ...jsonValue(parent[field], {}) };
  const lines = normalizeLines(jsonValue(parent.lines_json, []));
  const ordered = linesToMap(lines);
  Object.entries(deltaMap).forEach(([k, d]) => {
    const next = Number(current[k] || 0) + Number(d || 0);
    if (next < -0.0001) throw new Error('Incohérence de suivi sur le document d\'origine ' + docNo(parent));
    if (next > Number(ordered[k] || 0) + 0.0001) throw new Error('Quantité supérieure à celle du document d\'origine ' + docNo(parent) + ' (' + fmt(ordered[k] || 0) + ')');
    current[k] = Number(next.toFixed(4));
  });
  const update = { [field]: current };
  if (isProcessed) {
    const total = docQty(lines);
    const done = processedTotal(current);
    update.qty_done = done;
    update.doc_status = done >= total - 0.0001 ? 'closed' : (done > 0 ? 'partial' : 'open');
    if (type === 'sales') update.delivered = done >= total - 0.0001;
    else update.received = done >= total - 0.0001;
  }
  const { error: e2 } = await supabase.from(type).update(update).eq('id', parentId);
  if (e2) throw new Error(e2.message);
}

async function updateDoc(type, id, body) {
  requirePerm(type === 'sales' ? 'sales.write' : 'purchases.write', type === 'sales' ? 'Modification vente' : 'Modification achat');
  const isSales = type === 'sales';
  const { data: existing, error: readError } = await supabase.from(type).select('*').eq('id', id).single();
  if (readError) throw new Error(readError.message);

  if (isReturnDoc(existing)) {
    throw new Error('Un avoir / retour ne se modifie pas : supprimez-le puis recréez-le depuis la facture');
  }
  if (existing.stage === 'facture' && jsonValue(existing.payments_json, []).filter(p => !p.canceled).length) {
    throw new Error('Impossible de modifier une facture avec un règlement actif (annulez-le avant de modifier)');
  }

  const lines = normalizeLines(body.lignes || []);
  if (!lines.length) throw new Error('Le document doit contenir au moins une ligne');

  const oldMap = linesToMap(jsonValue(existing.lines_json, []));
  const newMap = linesToMap(lines);
  const keys = Array.from(new Set([...Object.keys(oldMap), ...Object.keys(newMap)]));
  const qtyChanged = keys.some(k => Math.abs(Number(newMap[k] || 0) - Number(oldMap[k] || 0)) > 0.0001);

  // Règle 1 : un document qui a des documents liés (livraisons, réceptions ou factures partielles)
  // ne peut plus changer de quantités — il faut d'abord modifier/supprimer les documents liés.
  if (qtyChanged && await docHasChildren(type, id)) {
    throw new Error('Quantités non modifiables : ce document a des documents liés (livraison/réception/facture partielle). Supprimez ou modifiez d\'abord les documents liés.');
  }

  const moved = docMovesStock(existing, type);
  const number = docNo(existing);
  const delta = {};
  keys.forEach(k => { const d = Number(newMap[k] || 0) - Number(oldMap[k] || 0); if (Math.abs(d) > 0.0001) delta[k] = Number(d.toFixed(4)); });
  const byKey = {};
  [...normalizeLines(jsonValue(existing.lines_json, [])), ...lines].forEach(l => { byKey[lineKey(l)] = l; });
  const plus = Object.entries(delta).filter(([, d]) => d > 0).map(([k, d]) => ({ ...byKey[k], qte: d }));
  const minus = Object.entries(delta).filter(([, d]) => d < 0).map(([k, d]) => ({ ...byKey[k], qte: -d }));

  // Règle 2 : contrôle de disponibilité (ventes)
  if (isSales && qtyChanged) {
    if (existing.stage === 'commande') {
      await assertSalesAvailability(lines, id);                 // nouvelle réservation complète, hors elle-même
    } else if (moved && plus.length) {
      await assertSalesAvailability(plus, null);                // seulement le supplément à sortir
    }
  }

  // Règle 3 : document qui a déjà mouvementé le stock → on applique uniquement la différence
  if (moved && qtyChanged) {
    const ref = 'Modification ' + number;
    if (isSales) {
      if (minus.length) await updateStock(minus, 1, 'Retour stock ' + ref, { docType: existing.stage, docNumber: number });
      if (plus.length) await updateStock(plus, -1, 'Sortie complémentaire ' + ref, { docType: existing.stage, docNumber: number });
    } else {
      if (plus.length) await updateStock(plus, 1, 'Entrée complémentaire ' + ref, { docType: existing.stage, docNumber: number, useLinePrice: true });
      if (minus.length) await updateStock(minus, -1, 'Retrait entrée ' + ref, { docType: existing.stage, docNumber: number, useLinePrice: true });
    }
    // Document lié à une commande : on répercute la différence sur le suivi livré/reçu du parent
    if (existing.base_doc_id) await adjustParentTracking(type, existing.base_doc_id, 'processed_lines_json', delta);
  }

  // Règle 4 : facture partielle (sans mouvement de stock) → répercuter sur le suivi facturé du BL/BR
  if (!moved && existing.stage === 'facture' && existing.base_doc_id && qtyChanged) {
    await adjustParentTracking(type, existing.base_doc_id, 'invoiced_lines_json', delta);
  }

  const vat = Number(body.tauxTva || existing.vat_rate || await getVatRate());
  const t = computeTotals(lines, vat, isSales);
  const payload = {
    date: body.date || today(),
    lines_json: lines,
    vat_rate: vat,
    total_ht: t.totalHT,
    vat: t.vat,
    total_ttc: t.totalTTC
  };

  if (moved) {
    const processed = linesToMap(lines);
    payload.processed_lines_json = processed;
    payload.qty_done = processedTotal(processed);
  }

  if (isSales) {
    payload.client_id = body.clientId || null;
    payload.client_name = body.clientNom || await partyName(type, payload.client_id);
  } else {
    payload.supplier_id = body.fournisseurId || null;
    payload.supplier_name = body.fournisseurNom || await partyName(type, payload.supplier_id);
  }

  const { error } = await supabase.from(type).update(payload).eq('id', id);
  if (error) throw new Error(error.message);
  await auditLog(isSales ? 'Ventes' : 'Achats', 'UPDATE', number, qtyChanged ? 'Modification document (quantités) — stock ajusté par différence' : 'Modification document');
}


async function deleteDoc(type, id) {
  requirePerm(type === 'sales' ? 'sales.delete' : 'purchases.delete', type === 'sales' ? 'Suppression vente' : 'Suppression achat');
  const { data: doc, error: e1 } = await supabase.from(type).select('*').eq('id', id).single();
  if (e1) throw new Error(e1.message);

  if (isReturnDoc(doc)) return deleteReturnDoc(type, doc);

  const payments = jsonValue(doc.payments_json, []);
  const activePayments = payments.filter(p => !p.canceled);
  if (activePayments.length) throw new Error('Impossible de supprimer un document avec règlement non annulé');

  if (await docHasChildren(type, id)) {
    throw new Error('Suppression impossible : ce document a des documents liés (livraison/réception/facture partielle). Supprimez d\'abord les documents liés.');
  }

  const number = docNo(doc);
  const moved = docMovesStock(doc, type);
  // On annule exactement ce que CE document a mouvementé (et non la totalité des lignes)
  const movedLines = moved
    ? normalizeLines(jsonValue(doc.lines_json, [])).map(l => ({ ...l, qte: Number(processedLines(doc)[lineKey(l)] ?? l.qte) })).filter(l => Number(l.qte) > 0)
    : [];

  if (type === 'sales' && movedLines.length) {
    await updateStock(movedLines, 1, 'Annulation sortie stock ' + number, { docType: doc.stage, docNumber: number });
  }
  if (type === 'purchases' && movedLines.length) {
    await updateStock(movedLines, -1, 'Annulation entrée stock ' + number, { docType: doc.stage, docNumber: number, useLinePrice: true });
  }

  // Mise à jour du document d'origine (commande / BL / BR)
  if (doc.base_doc_id) {
    const neg = {};
    Object.entries(linesToMap(jsonValue(doc.lines_json, []))).forEach(([k, q]) => { neg[k] = -Number(q || 0); });
    if (moved) await adjustParentTracking(type, doc.base_doc_id, 'processed_lines_json', neg);
    else if (doc.stage === 'facture') await adjustParentTracking(type, doc.base_doc_id, 'invoiced_lines_json', neg);
  }

  const { error } = await supabase.from(type).delete().eq('id', id);
  if (error) throw new Error(error.message);
  await auditLog(type === 'sales' ? 'Ventes' : 'Achats', 'DELETE', number, 'Suppression document');
}

// Facturation partielle d'un bon de livraison (ventes) ou d'un bon de réception (achats).
// Le stock a déjà été mouvementé par le BL/BR : la facture partielle ne touche pas au stock.
async function partialInvoiceDoc(type, id, body) {
  requirePerm(type === 'sales' ? 'sales.write' : 'purchases.write', 'Facturation partielle');
  const isSales = type === 'sales';
  const { data: doc, error } = await supabase.from(type).select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  const src = isSales ? 'livraison' : 'reception';
  if (doc.stage !== src) throw new Error(isSales ? 'La facturation partielle se fait depuis un bon de livraison' : 'La facturation partielle se fait depuis un bon de réception');

  const lines = selectedPartialLines(doc, body.lignes || [], docInvoiceRemainingLines(doc));
  const vatRate = Number(doc.vat_rate || await getVatRate());
  const t = computeTotals(lines, vatRate, isSales);
  if (isSales) await assertCreditLimit(doc.client_id, t.totalTTC, body.forceCredit);
  const number = await nextNumber(docPrefix(type, 'facture'));
  const session = getStoredSession();

  const common = {
    date: body.date || today(),
    stage: 'facture',
    numbers_json: { facture: number },
    lines_json: lines,
    payments_json: [],
    vat_rate: vatRate,
    total_ht: t.totalHT,
    vat: t.vat,
    total_ttc: t.totalTTC,
    qty_done: docQty(lines),
    processed_lines_json: {},
    doc_status: 'closed',
    created_by: session?.user?.id || null,
    base_doc_id: doc.id,
    branch_id: doc.branch_id || branchId(session)
  };
  const payload = isSales
    ? { ...common, client_id: doc.client_id, client_name: doc.client_name, delivered: false }
    : { ...common, supplier_id: doc.supplier_id, supplier_name: doc.supplier_name, received: false };
  if (doc.trip_id && isSales) payload.trip_id = doc.trip_id;

  const { error: e2 } = await supabase.from(type).insert(payload);
  if (e2) throw new Error(e2.message);

  await adjustParentTracking(type, doc.id, 'invoiced_lines_json', linesToMap(lines));
  await auditLog(isSales ? 'Ventes' : 'Achats', 'PARTIAL_INVOICE', number, 'Facturation partielle de ' + docNo(doc) + ' : ' + docQty(lines));
}

// Avoir client (ventes) ou retour fournisseur (achats) depuis une facture.
// - remet (ventes) ou sort (achats) le stock si demandé
// - impute le montant sur la facture d'origine (règlement de type « Avoir »), le surplus est à rembourser
async function returnDoc(type, id, body) {
  requirePerm(type === 'sales' ? 'sales.write' : 'purchases.write', type === 'sales' ? 'Avoir client' : 'Retour fournisseur');
  requireUse(type === 'sales' ? 'sales.return' : 'purchases.return', type === 'sales' ? 'Avoir client' : 'Retour fournisseur');
  const isSales = type === 'sales';
  const { data: inv, error } = await supabase.from(type).select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  if (inv.stage !== 'facture') throw new Error('Un avoir / retour se fait depuis une facture');

  const lines = selectedPartialLines(inv, body.lignes || [], docReturnRemainingLines(inv));
  const restock = body.restock !== false;
  const stage = isSales ? 'avoir' : 'retour';
  const vatRate = Number(inv.vat_rate || await getVatRate());
  const t = computeTotals(lines, vatRate, isSales);
  const number = await nextNumber(docPrefix(type, stage));

  if (restock) {
    if (isSales) await updateStock(lines, 1, 'Retour client ' + number, { docType: stage, docNumber: number });
    else await updateStock(lines, -1, 'Retour fournisseur ' + number, { docType: stage, docNumber: number, useLinePrice: true });
  }

  const info = paymentInfo(inv);
  const imputed = Math.max(0, Math.min(Number(t.totalTTC || 0), Number(info.rest || 0)));
  const session = getStoredSession();
  const common = {
    date: body.date || today(),
    stage,
    numbers_json: { [docKey(type, stage)]: number },
    lines_json: lines,
    payments_json: [],
    vat_rate: vatRate,
    total_ht: t.totalHT,
    vat: t.vat,
    total_ttc: t.totalTTC,
    qty_done: docQty(lines),
    processed_lines_json: {},
    doc_status: 'closed',
    restocked: restock,
    imputed_amount: imputed,
    created_by: session?.user?.id || null,
    base_doc_id: inv.id,
    branch_id: inv.branch_id || branchId(session)
  };
  const payload = isSales
    ? { ...common, client_id: inv.client_id, client_name: inv.client_name, delivered: false }
    : { ...common, supplier_id: inv.supplier_id, supplier_name: inv.supplier_name, received: false };
  const { error: e2 } = await supabase.from(type).insert(payload);
  if (e2) throw new Error(e2.message);

  // Mise à jour de la facture d'origine : quantités retournées + imputation
  const returned = { ...jsonValue(inv.returned_lines_json, {}) };
  Object.entries(linesToMap(lines)).forEach(([k, q]) => { returned[k] = Number((Number(returned[k] || 0) + Number(q)).toFixed(4)); });
  const payments = jsonValue(inv.payments_json, []);
  if (imputed > 0.01) {
    payments.push({ id: 'AV' + Date.now(), canceled: false, canceledAt: '', canceledBy: '', cancelReason: '', date: body.date || today(), mode: 'Avoir', montant: Number(imputed.toFixed(2)), avoirNumber: number, note: (isSales ? 'Avoir ' : 'Retour ') + number });
  }
  const { error: e3 } = await supabase.from(type).update({ returned_lines_json: returned, payments_json: payments }).eq('id', inv.id);
  if (e3) throw new Error(e3.message);
  await auditLog(isSales ? 'Ventes' : 'Achats', isSales ? 'CREDIT_NOTE' : 'SUPPLIER_RETURN', number, (isSales ? 'Avoir sur ' : 'Retour sur ') + docNo(inv) + ' : ' + dh(t.totalTTC) + (restock ? ' (stock mis à jour)' : ' (sans mouvement de stock)'));
}

async function deleteReturnDoc(type, doc) {
  const isSales = type === 'sales';
  const number = docNo(doc);
  const lines = normalizeLines(jsonValue(doc.lines_json, []));
  if (doc.restocked !== false) {
    if (isSales) await updateStock(lines, -1, 'Annulation avoir ' + number, { docType: doc.stage, docNumber: number });
    else await updateStock(lines, 1, 'Annulation retour ' + number, { docType: doc.stage, docNumber: number, useLinePrice: true });
  }
  if (doc.base_doc_id) {
    const { data: inv } = await supabase.from(type).select('*').eq('id', doc.base_doc_id).maybeSingle();
    if (inv) {
      const returned = { ...jsonValue(inv.returned_lines_json, {}) };
      Object.entries(linesToMap(lines)).forEach(([k, q]) => { returned[k] = Math.max(0, Number((Number(returned[k] || 0) - Number(q)).toFixed(4))); });
      const payments = jsonValue(inv.payments_json, []).map(p => (p.avoirNumber === number && !p.canceled)
        ? { ...p, canceled: true, canceledAt: new Date().toISOString(), canceledBy: currentUserLabel(), cancelReason: 'Suppression ' + number }
        : p);
      const { error } = await supabase.from(type).update({ returned_lines_json: returned, payments_json: payments }).eq('id', inv.id);
      if (error) throw new Error(error.message);
    }
  }
  const { error } = await supabase.from(type).delete().eq('id', doc.id);
  if (error) throw new Error(error.message);
  await auditLog(isSales ? 'Ventes' : 'Achats', 'DELETE', number, 'Suppression avoir / retour');
}


async function advanceDoc(type, id, opts = {}) {
  const isSales = type === 'sales';
  const { data: doc, error } = await supabase.from(type).select('*').eq('id', id).single();
  if (error) throw new Error(error.message);

  const next = nextStageAllowed(doc, type);
  if (!next) return;

  const remainingLines = docRemainingLines(doc).filter(l => Number(l.remainingQty || 0) > 0);
  if ((next === 'livraison' || next === 'reception') && !remainingLines.length) {
    throw new Error('Aucune quantité restante à traiter');
  }

  // Ventes : la commande réserve le stock → contrôle du disponible (hors réservation de ce document)
  if (isSales && next === 'commande') {
    await assertSalesAvailability(jsonValue(doc.lines_json, []), doc.id);
  }
  if (isSales && next === 'livraison') {
    await assertSalesAvailability(remainingLines.map(l => ({ ...l, qte: Number(l.remainingQty || 0) })), doc.id);
  }

  // BL/BR déjà facturé partiellement : on facture uniquement le reste (facture liée)
  if (next === 'facture' && docInvoicedQty(doc) > 0) {
    const rest = docInvoiceRemainingLines(doc).filter(l => Number(l.remainingQty || 0) > 0);
    if (!rest.length) throw new Error('Ce document est déjà entièrement facturé');
    await partialInvoiceDoc(type, doc.id, { date: today(), forceCredit: opts.forceCredit, lignes: rest.map(l => ({ ...l, qteToProcess: Number(l.remainingQty || 0), excluded: false })) });
    return;
  }
  if (isSales && next === 'facture') {
    await assertCreditLimit(doc.client_id, Number(doc.total_ttc || 0) - paymentInfo(doc).paid, opts.forceCredit);
  }

  const key = docKey(type, next);
  const prefix = docPrefix(type, next);
  const nums = { ...jsonValue(doc.numbers_json, {}) };
  nums[key] = nums[key] || await nextNumber(prefix);

  const totalQty = docQty(normalizeLines(jsonValue(doc.lines_json, [])));
  let newDone = Number(doc.qty_done || 0);
  let status = 'open';
  let processed = processedLines(doc);

  if (isSales && next === 'livraison') {
    const linesToMove = remainingLines.map(l => ({ ...l, qte: Number(l.remainingQty || 0) }));
    await updateStock(linesToMove, -1, 'Livraison vente ' + nums[key], { docType: next, docNumber: nums[key] });
    processed = mergeProcessedLines(doc, linesToMove);
    newDone = processedTotal(processed);
    status = newDone >= totalQty ? 'closed' : 'partial';
  } else if (!isSales && next === 'reception') {
    const linesToMove = remainingLines.map(l => ({ ...l, qte: Number(l.remainingQty || 0) }));
    await updateStock(linesToMove, 1, 'Réception achat ' + nums[key], { docType: next, docNumber: nums[key], useLinePrice: true });
    processed = mergeProcessedLines(doc, linesToMove);
    newDone = processedTotal(processed);
    status = newDone >= totalQty ? 'closed' : 'partial';
  } else if (next === 'facture') {
    newDone = totalQty;
    status = 'closed';
  }

  const payload = isSales ? {
    stage: next,
    numbers_json: nums,
    delivered: next === 'livraison' ? true : doc.delivered,
    qty_done: newDone,
    processed_lines_json: processed,
    doc_status: status
  } : {
    stage: next,
    numbers_json: nums,
    received: next === 'reception' ? true : doc.received,
    qty_done: newDone,
    processed_lines_json: processed,
    doc_status: status
  };

  const { error: e2 } = await supabase.from(type).update(payload).eq('id', id);
  if (e2) throw new Error(e2.message);
  await auditLog(isSales ? 'Ventes' : 'Achats', 'ADVANCE', nums[key], 'Passage à ' + next);
}

async function payDoc(type, id, body) {
  requirePerm(type === 'sales' ? 'sales.pay' : 'purchases.pay', type === 'sales' ? 'Encaissement' : 'Décaissement');
  const { data: doc, error } = await supabase.from(type).select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  if (doc.stage !== 'facture') throw new Error('Le règlement est autorisé uniquement sur les factures');
  const payments = jsonValue(doc.payments_json, []);
  const info = paymentInfo(doc);
  const montant = Number(body.montant || info.rest || 0);
  if (montant <= 0) throw new Error('Montant de règlement invalide');
  payments.push({
    id: String(Date.now()), canceled: false, canceledAt: '', canceledBy: '', cancelReason: '', date: body.date || today(), mode: body.mode || 'Espèces', montant,
    cashRegister: body.cashRegister || '', receiptNo: body.receiptNo || '', chequeNo: body.chequeNo || '', bank: body.bank || '', dueDate: body.dueDate || '', paymentStatus: body.paymentStatus || '', transferRef: body.transferRef || '', valueDate: body.valueDate || '', terminal: body.terminal || '', transactionNo: body.transactionNo || '', billNo: body.billNo || '', note: body.note || ''
  });
  const { error: e2 } = await supabase.from(type).update({ payments_json: payments }).eq('id', id);
  if (e2) throw new Error(e2.message);
  await auditLog(type === 'sales' ? 'Paiements ventes' : 'Paiements achats', 'PAYMENT', docNo(doc), 'Règlement ' + montant + ' DH');
}


async function cancelPayment(type, docId, paymentId, reason = '') {
  const { data: doc, error } = await supabase.from(type).select('*').eq('id', docId).single();
  if (error) throw new Error(error.message);

  const payments = jsonValue(doc.payments_json, []);
  const idx = payments.findIndex(p => String(p.id) === String(paymentId));
  if (idx < 0) throw new Error('Règlement introuvable');
  if (payments[idx].canceled) throw new Error('Règlement déjà annulé');
  if (payments[idx].mode === 'Avoir') throw new Error('Cette imputation provient de l\'avoir ' + (payments[idx].avoirNumber || '') + ' : supprimez l\'avoir pour l\'annuler');

  const session = getStoredSession();
  payments[idx] = {
    ...payments[idx],
    canceled: true,
    canceledAt: new Date().toISOString(),
    canceledBy: currentUserLabel(),
    cancelReason: reason || 'Annulation règlement'
  };

  const { error: e2 } = await supabase.from(type).update({ payments_json: payments }).eq('id', docId);
  if (e2) throw new Error(e2.message);

  await auditLog(type === 'sales' ? 'Paiements ventes' : 'Paiements achats', 'CANCEL_PAYMENT', docNo(doc), 'Annulation règlement ' + Number(payments[idx].montant || 0) + ' DH');
}


async function partialDoc(type, id, body) {
  const isSales = type === 'sales';
  const { data: doc, error } = await supabase.from(type).select('*').eq('id', id).single();
  if (error) throw new Error(error.message);

  if (doc.stage === 'facture') throw new Error('Action partielle non autorisée sur une facture');
  if (isSales && !['commande', 'livraison'].includes(doc.stage)) throw new Error('La livraison partielle se fait depuis une commande');
  if (!isSales && !['commande', 'reception'].includes(doc.stage)) throw new Error('La réception partielle se fait depuis une commande achat');

  const lines = selectedPartialLines(doc, body.lignes || []);
  if (isSales) await assertSalesAvailability(lines, doc.id);
  const vatRate = Number(doc.vat_rate || await getVatRate());
  const t = computeTotals(lines, vatRate, isSales);
  const stage = isSales ? 'livraison' : 'reception';
  const key = docKey(type, stage);
  const number = await nextNumber(docPrefix(type, stage));
  const numbers = { [key]: number };

  await updateStock(lines, isSales ? -1 : 1, (isSales ? 'Livraison partielle ' : 'Réception partielle ') + number, { docType: stage, docNumber: number, useLinePrice: !isSales });

  const session = getStoredSession();
  const originalTotal = docQty(normalizeLines(jsonValue(doc.lines_json, [])));
  const processed = mergeProcessedLines(doc, lines);
  const newDone = processedTotal(processed);
  const parentStatus = newDone >= originalTotal ? 'closed' : 'partial';

  const payload = isSales ? {
    date: body.date || today(),
    client_id: doc.client_id,
    client_name: doc.client_name,
    stage,
    numbers_json: numbers,
    lines_json: lines,
    payments_json: [],
    vat_rate: vatRate,
    total_ht: t.totalHT,
    vat: t.vat,
    total_ttc: t.totalTTC,
    delivered: true,
    qty_done: docQty(lines),
    processed_lines_json: mergeProcessedLines({ processed_lines_json: {} }, lines),
    doc_status: 'closed',
    created_by: session?.user?.id || null,
    base_doc_id: doc.id,
    branch_id: doc.branch_id || branchId(session)
  } : {
    date: body.date || today(),
    supplier_id: doc.supplier_id,
    supplier_name: doc.supplier_name,
    stage,
    numbers_json: numbers,
    lines_json: lines,
    payments_json: [],
    vat_rate: vatRate,
    total_ht: t.totalHT,
    vat: t.vat,
    total_ttc: t.totalTTC,
    received: true,
    qty_done: docQty(lines),
    processed_lines_json: mergeProcessedLines({ processed_lines_json: {} }, lines),
    doc_status: 'closed',
    created_by: session?.user?.id || null,
    base_doc_id: doc.id,
    branch_id: doc.branch_id || branchId(session)
  };

  const { error: e2 } = await supabase.from(type).insert(payload);
  if (e2) throw new Error(e2.message);

  const { error: e3 } = await supabase.from(type).update({
    qty_done: newDone,
    processed_lines_json: processed,
    doc_status: parentStatus,
    delivered: isSales ? newDone >= originalTotal : doc.delivered,
    received: !isSales ? newDone >= originalTotal : doc.received
  }).eq('id', id);
  if (e3) throw new Error(e3.message);

  await auditLog(isSales ? 'Ventes' : 'Achats', isSales ? 'PARTIAL_DELIVERY' : 'PARTIAL_RECEIPT', number, 'Traitement partiel par produit : ' + docQty(lines));
}

async function loadPayments() {
  const [{ data: sales, error: e1 }, { data: purchases, error: e2 }] = await Promise.all([
    applyDocScope(supabase.from('sales').select('*'), 'sales', getStoredSession()).order('id', { ascending: false }),
    applyDocScope(supabase.from('purchases').select('*'), 'purchases', getStoredSession()).order('id', { ascending: false })
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  const enc = (sales || []).flatMap(d => jsonValue(d.payments_json, []).map(p => ({ type: 'encaissement', sourceTable: 'sales', docType: 'vente', docId: d.id, docNumber: docNo(d), tiers: d.client_name, branchId: d.branch_id, ...p })));
  const dec = (purchases || []).flatMap(d => jsonValue(d.payments_json, []).map(p => ({ type: 'decaissement', sourceTable: 'purchases', docType: 'achat', docId: d.id, docNumber: docNo(d), tiers: d.supplier_name, branchId: d.branch_id, ...p })));
  return [...enc, ...dec].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

async function loadParties(type) {
  const session = getStoredSession();
  let q = supabase.from(type).select('*').order('name');

  if (isAdmin(session) || isSuperAdmin(session)) {
    q = applyBranchFilterToQuery(q, session);
  } else if (branchId(session)) {
    q = q.eq('branch_id', branchId(session));
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const labels = await loadUserLabels();
  return enrichParties((data || []).filter(x => canSeePartyRecord(x, type, session)), labels);
}

async function saveParty(type, body) {
  const writePerm = type === 'clients' ? 'clients.write' : 'suppliers.write';
  requirePerm(writePerm, type === 'clients' ? 'Gestion clients' : 'Gestion fournisseurs');

  const session = getStoredSession();
  const common = {
    name: body.name || '',
    ice: body.ice || '',
    phone: body.phone || '',
    city: body.city || '',
    address: body.address || '',
    branch_id: isAdmin(session) ? (body.branch_id || body.branchId || branchId(session)) : branchId(session),
    assigned_to: type === 'clients' ? (body.assigned_to || body.assignedTo || session?.user?.id || null) : null
  };

  if (!body.id) {
    common.created_by = session?.user?.id || null;
    common.created_by_label = currentUserLabel();
  }

  const payload = type === 'clients'
    ? { ...common, type: body.type || 'entreprise', price_tier: body.price_tier === 'gros' ? 'gros' : 'detail', credit_limit: Math.max(0, Number(body.credit_limit || 0)) }
    : { ...common, contact: body.contact || '' };

  const q = body.id ? supabase.from(type).update(payload).eq('id', body.id) : supabase.from(type).insert(payload);
  const { error } = await q;
  if (error) throw new Error(error.message);

  await auditLog(type === 'clients' ? 'Clients' : 'Fournisseurs', body.id ? 'UPDATE' : 'CREATE', payload.name, body.id ? 'Modification tiers' : 'Création tiers');
}
async function deleteParty(type, id) {
  const delPerm = type === 'clients' ? 'clients.delete' : 'suppliers.delete';
  requirePerm(delPerm, type === 'clients' ? 'Suppression client' : 'Suppression fournisseur');

  const { data: row } = await supabase.from(type).select('name').eq('id', id).maybeSingle();
  const { error } = await supabase.from(type).delete().eq('id', id);
  if (error) throw new Error(error.message);

  await auditLog(type === 'clients' ? 'Clients' : 'Fournisseurs', 'DELETE', row?.name || id, 'Suppression tiers');
}
async function loadUsers() {
  const session = getStoredSession();
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, active, branch_id, branches(name), role_id, roles(id, name)')
    .order('username');

  if (error) throw new Error(error.message);

  // Profil et droguerie à plat pour l'affichage (colonnes « Profil » / « Droguerie »)
  let rows = (data || []).map(u => ({ ...u, role: u.roles?.name || u.role || '', branch_name: u.branches?.name || u.branch_name || '' }));
  if (!isSuperAdmin(session)) rows = rows.filter(u => !isSuperAdminUserRow(u));

  const bid = selectedBranchId(session);
  if (bid) rows = rows.filter(u => Number(u.branch_id || 0) === Number(bid) || !u.branch_id);

  return rows;
}

async function saveUser(body) {
  const payload = {
    username: body.username || '',
    full_name: body.full_name || '',
    role_id: body.role_id || 3,
    branch_id: body.branch_id || null,
    active: body.active !== false
  };

  if (await isSecureBackend()) {
    let userId = body.id;
    if (userId) {
      const { error } = await supabase.from('users').update(payload).eq('id', userId);
      if (error) throw new Error(error.message);
    } else {
      if (!body.password || String(body.password).length < 4) throw new Error('Mot de passe obligatoire (4 caractères minimum)');
      const { data, error } = await supabase.from('users').insert({ ...payload, password_hash: '***' }).select('id').single();
      if (error) throw new Error(error.message);
      userId = data.id;
    }
    if (body.password) {
      const { error } = await supabase.rpc('app_set_password', { p_user_id: userId, p_new_password: body.password });
      if (error) throw rpcError(error);
    }
    return;
  }

  if (body.password) {
    payload.password_hash = body.password;
  }

  if (body.id) {
    const { error } = await supabase.from('users').update(payload).eq('id', body.id);
    if (error) throw new Error(error.message);
  } else {
    payload.password_hash = body.password || 'changeme';
    const { error } = await supabase.from('users').insert(payload);
    if (error) throw new Error(error.message);
  }
}

async function setUserActive(userId, active) {
  const { error } = await supabase.from('users').update({ active }).eq('id', userId);
  if (error) throw new Error(error.message);
}

function LoginPage({ L, lang, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const s = await login(username, password);
      onLogin(s);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className={'min-h-screen bg-slate-900 grid place-items-center ' + (lang === 'ar' ? 'rtl' : '')}>
      <form onSubmit={submit} className="bg-white p-7 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-amber-500 rounded-xl w-12 h-12 grid place-items-center font-black">DP</span>
          <div>
            <h1 className="font-bold text-xl">DrogueriePro</h1>
            <p className="text-xs text-slate-400">{L('login')}</p>
          </div>
        </div>

        {err ? <p className="bg-red-50 text-red-600 p-2 rounded mb-3">{err}</p> : null}

        <label className="text-xs text-slate-500">{L('username')}</label>
        <input className="input mb-3" value={username} onChange={e => setUsername(e.target.value)} />

        <label className="text-xs text-slate-500">{L('password')}</label>
        <input className="input mb-4" type="password" value={password} onChange={e => setPassword(e.target.value)} />

        <button className="btn bg-amber-500 w-full">{L('connect')}</button>
      </form>
    </div>
  );
}

function Layout({ L, lang, toggleLang, session, setSession }) {
  const [page, setPage] = useState(isSuperAdmin(session) ? 'saas' : 'dashboard');
  const [disabledModules, setDisabledModules] = useState(getDisabledModulesCache());
  const [globalBranchFilter, setGlobalBranchFilter] = useState(getSelectedBranchFilter());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const items = [
['dashboard', L('dashboard'), 'dashboard.read'],
    ['saas', L('saasCenter'), 'superadmin.manage'],
    ['backup', L('backupCenter'), 'backup.manage'],
    ['profit', L('profitCenter'), 'profit.read'],
    ['reporting', L('reporting'), 'reporting.read'],
    ['tools', L('tools'), 'tools.read'],
    ['products', L('products'), 'products.read'],
    ['pos', L('posMod'), 'pos.use'],
    ['sales', L('sales'), 'sales.read'],
    ['purchases', L('purchases'), 'purchases.read'],
    ['payments', L('payments'), 'payments.read'],
    ['stockMoves', L('stockMoves'), 'stock.read'],
    ['settings', L('settings'), 'settings.manage'],
    ['permissions', L('permissions'), 'permissions.manage'],
    ['branches', L('branches'), 'branches.manage'],
    ['mobileApp', L('mobileApp'), 'mobile.manage'],
    ['clients', L('clients'), 'clients.read'],
    ['suppliers', L('suppliers'), 'suppliers.read'],
    ['expenses', L('expensesMod'), 'expenses.read'],
    ['users', L('users'), 'users.read']
  ];

  useEffect(() => {
    refreshSaasModulesCache().then(setDisabledModules);
    const handler = e => setDisabledModules(e.detail || getDisabledModulesCache());
    window.addEventListener('droguerie_modules_changed', handler);
    // Droits du profil courant modifiés depuis la page Autorisations
    const permsHandler = () => { const s = getStoredSession(); if (s) setSession(s); };
    window.addEventListener('droguerie_perms_changed', permsHandler);
    return () => { window.removeEventListener('droguerie_modules_changed', handler); window.removeEventListener('droguerie_perms_changed', permsHandler); };
  }, []);

  useEffect(() => {
    const handler = e => setGlobalBranchFilter(e.detail || getSelectedBranchFilter());
    window.addEventListener('droguerie_branch_filter_changed', handler);
    return () => window.removeEventListener('droguerie_branch_filter_changed', handler);
  }, []);

  useEffect(() => {
    const visible = items.filter(item => visibleMenuItem(item, session, disabledModules));
    if (!visible.some(x => x[0] === page)) {
      setPage(visible[0]?.[0] || (isSuperAdmin(session) ? 'saas' : 'dashboard'));
    }
  }, [disabledModules, session, page]);

  const visibleItems = items.filter(item => visibleMenuItem(item, session, disabledModules));

  return (
    <div className={lang === 'ar' ? 'rtl' : ''}>
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>☰</button>
        <div className="font-bold">Droguerie<span className="text-amber-500">Pro</span></div>
        <button className="mobile-menu-btn" onClick={toggleLang}>{L('lang')}</button>
      </div>
      {mobileMenuOpen ? <div className="mobile-backdrop" onClick={() => setMobileMenuOpen(false)} /> : null}
      <div className="min-h-screen flex app-shell">
        <aside className={'w-64 bg-slate-900 text-slate-300 flex flex-col app-sidebar ' + (mobileMenuOpen ? 'open' : '')}>
          <div className="p-6 border-b border-slate-800">
            <div className="text-xl font-black text-white">Droguerie<span className="text-amber-500">Pro</span></div>
            <div className="text-xs text-slate-400 mt-1">{session.user.full_name || session.user.username} · {session.user.role}</div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-auto">
            {visibleItems.map(item => (
              <button
                key={item[0]}
                onClick={() => { setPage(item[0]); setMobileMenuOpen(false); }}
                className={'w-full text-left px-3 py-2 rounded-lg ' + (page === item[0] ? 'bg-amber-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-white')}
              >
                {item[1]}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button className="btn bg-white text-slate-900 w-full" onClick={toggleLang}>{L('lang')}</button>
            <button className="btn bg-slate-800 text-white w-full" onClick={async () => { await refreshCurrentSession(setSession); alert('Droits actualisés'); }}>Rafraîchir droits</button>
            <button className="btn bg-slate-800 text-white w-full" onClick={() => setPwdOpen(true)}>{L('myPassword')}</button>
            <button className="btn bg-red-600 text-white w-full" onClick={async () => { await logoutSession(); setSession(null); }}>{L('logout')}</button>
          </div>
        </aside>
        <main className="flex-1 p-6 max-w-[1500px] mx-auto w-full app-main pro-main">
          <BranchFilter L={L} value={globalBranchFilter} onChange={v => { setSelectedBranchFilter(v); setGlobalBranchFilter(v); }} />
          <div key={page + '-' + globalBranchFilter}>

          {page === 'dashboard' ? <Dashboard L={L} /> : null}
          {page === 'saas' ? <SuperAdminCenter L={L} /> : null}
          {page === 'backup' ? <BackupCenter L={L} /> : null}
          {page === 'profit' ? <ProfitCenter L={L} /> : null}
          {page === 'reporting' ? <ReportingCenter L={L} /> : null}
          {page === 'tools' ? <ToolsCenter L={L} /> : null}
          {page === 'products' ? <Products L={L} /> : null}
          {page === 'pos' ? <PosCenter L={L} /> : null}
          {page === 'sales' ? <Docs L={L} type="sales" /> : null}
          {page === 'purchases' ? <Docs L={L} type="purchases" /> : null}
          {page === 'payments' ? <Payments L={L} /> : null}
          {page === 'stockMoves' ? <StockMovements L={L} /> : null}
          {page === 'settings' ? <Settings L={L} /> : null}
          {page === 'permissions' ? <Permissions L={L} /> : null}
          {page === 'branches' ? <Branches L={L} /> : null}
          {page === 'mobileApp' ? <MobileAppAdmin L={L} /> : null}
          {page === 'clients' ? <Parties L={L} type="clients" /> : null}
          {page === 'suppliers' ? <Parties L={L} type="suppliers" /> : null}
          {page === 'expenses' ? <ExpensesCenter L={L} /> : null}
          {page === 'users' ? <Users L={L} /> : null}
        
          </div>
        </main>
      </div>
      {pwdOpen ? <ChangePasswordModal L={L} close={() => setPwdOpen(false)} /> : null}
    </div>
  );
}

function ChangePasswordModal({ L, close }) {
  const [f, setF] = useState({ old: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  async function save() {
    if (f.next.length < 4) return alert('Mot de passe trop court (4 caractères minimum)');
    if (f.next !== f.confirm) return alert('Les deux nouveaux mots de passe ne correspondent pas');
    setBusy(true);
    try { await changeOwnPassword(f.old, f.next); alert('Mot de passe modifié'); close(); }
    catch (e) { alert(e.message); }
    setBusy(false);
  }
  return (
    <Modal title={L('myPassword')} onClose={close}>
      <label className="text-xs text-slate-500">{L('oldPassword')}<input className="input mt-1 mb-2" type="password" value={f.old} onChange={e => setF({ ...f, old: e.target.value })} /></label>
      <label className="text-xs text-slate-500">{L('newPassword')}<input className="input mt-1 mb-2" type="password" value={f.next} onChange={e => setF({ ...f, next: e.target.value })} /></label>
      <label className="text-xs text-slate-500">{L('confirmPassword')}<input className="input mt-1 mb-2" type="password" value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} /></label>
      <button disabled={busy} onClick={save} className="btn bg-amber-500 mt-2">{L('save')}</button>
    </Modal>
  );
}


function Header({ title, children }) {
  return (
    <div className="flex justify-between items-end mb-5">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function Table({ children }) {
  return <div className="card overflow-hidden"><table className="table w-full">{children}</table></div>;
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 grid place-items-center p-4 overflow-auto">
      <div className={'bg-white rounded-2xl shadow-2xl w-full p-5 ' + (wide ? 'max-w-4xl' : 'max-w-lg')}>
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Badge({ children, tone }) {
  const tones = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-sky-100 text-sky-700',
    slate: 'bg-slate-100 text-slate-700'
  };
  return <span className={'px-2 py-1 rounded text-xs font-semibold ' + (tones[tone] || tones.slate)}>{children}</span>;
}

function ErrorBox({ msg }) {
  return <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl"><b>Erreur :</b> {msg}</div>;
}



function ToolsCenter({ L }) {
  const [calc, setCalc] = useState('');
  const [cost, setCost] = useState(100);
  const [margin, setMargin] = useState(25);

  function safeCalc() {
    try {
      if (!/^[0-9+\-*/().,\s]+$/.test(calc)) return 'Erreur';
      // eslint-disable-next-line no-new-func
      const val = Function('"use strict";return (' + calc.replace(',', '.') + ')')();
      return Number.isFinite(val) ? fmt(val) : 'Erreur';
    } catch {
      return 'Erreur';
    }
  }

  const suggested = suggestSalePrice(Number(cost || 0), Number(margin || 0));

  return (
    <>
      <Header title={L('tools')} />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="font-black text-lg mb-3">{L('calculator')}</h2>
          <input className="input mb-3 text-xl font-mono" value={calc} onChange={e => setCalc(e.target.value)} placeholder="1200 + 250 * 2" />
          <div className="tool-result mb-3">{L('result')} : <b>{calc ? safeCalc() : '-'}</b></div>
          <div className="flex gap-2 flex-wrap">
            {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','+','(',')'].map(x => <button key={x} className="btn bg-white border" onClick={() => setCalc(calc + x)}>{x}</button>)}
            <button className="btn bg-red-600 text-white" onClick={() => setCalc('')}>{L('clear')}</button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-black text-lg mb-3">{L('marginCalculator')}</h2>
          <label className="text-xs text-slate-500">{L('purchaseCost')}
            <input className="input mt-1 mb-3" type="number" value={cost} onChange={e => setCost(e.target.value)} />
          </label>
          <label className="text-xs text-slate-500">{L('wantedMargin')} %
            <input className="input mt-1 mb-3" type="number" value={margin} onChange={e => setMargin(e.target.value)} />
          </label>
          <div className="tool-price">
            <span>{L('salePriceFromMargin')}</span>
            <b>{dh(suggested)}</b>
          </div>
        </div>
      </div>
    </>
  );
}



function ageBucket(dateStr) {
  if (!dateStr) return 'due90p';
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'current';
  if (days <= 30) return 'due0_30';
  if (days <= 60) return 'due31_60';
  if (days <= 90) return 'due61_90';
  return 'due90p';
}

function buildDebtRows(docs, type) {
  const map = {};
  (docs || []).filter(d => d.stage === 'facture' && Number(d.reste || 0) > 0.01).forEach(d => {
    const key = type === 'clients' ? (d.client_id || d.client_name || 'unknown') : (d.supplier_id || d.supplier_name || 'unknown');
    const name = type === 'clients' ? (d.client_name || '-') : (d.supplier_name || '-');
    if (!map[key]) map[key] = { id: key, name, total: 0, current: 0, due0_30: 0, due31_60: 0, due61_90: 0, due90p: 0, docs: 0 };
    const amount = Number(d.reste || 0);
    const bucket = ageBucket(d.due_date || d.date);
    map[key].total += amount;
    map[key].docs += 1;
    if (bucket === 'current') map[key].current += amount;
    else map[key][bucket] += amount;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

function ReportingCenter({ L }) {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dateFrom, setDateFrom] = useState(today().slice(0, 8) + '01');
  const [dateTo, setDateTo] = useState(today());
  const [err, setErr] = useState('');

  async function load() {
    try {
      setErr('');
      const session = getStoredSession();
      const [{ data: s, error: sErr }, { data: p, error: pErr }, labels, tripsData, expensesData] = await Promise.all([
        applyDocScope(supabase.from('sales').select('*'), 'sales', session).order('date', { ascending: false }),
        applyDocScope(supabase.from('purchases').select('*'), 'purchases', session).order('date', { ascending: false }),
        loadUserLabels(),
        loadTrips().catch(() => []),
        loadExpenses().catch(() => [])
      ]);
      if (sErr) throw sErr;
      if (pErr) throw pErr;
      setUsersMap(labels || {});
      setSales(enrichDocs(s || [], labels));
      setPurchases(enrichDocs(p || [], labels));
      setTrips(tripsData || []);
      setExpenses(expensesData || []);
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, []);

  if (err) return <ErrorBox msg={err} />;

  // Filtre de période (Du / Au) appliqué à tous les tableaux du reporting
  const inRange = (d) => {
    const v = String(d || '').slice(0, 10);
    if (!v) return true;
    if (dateFrom && v < dateFrom) return false;
    if (dateTo && v > dateTo) return false;
    return true;
  };
  const allSales = sales;
  const fSales = sales.filter(d => inRange(d.date));
  const fPurchases = purchases.filter(d => inRange(d.date));
  const fTrips = trips.filter(t => inRange(t.date));
  const fExpenses = expenses.filter(e => inRange(e.date));

  const clientDebts = buildDebtRows(fSales, 'clients');
  const supplierDebts = buildDebtRows(fPurchases, 'suppliers');
  const salesBySeller = groupByCreator(fSales, usersMap);
  const debtBySeller = groupDebtBySeller(fSales, usersMap);
  const totalCA = salesBySeller.reduce((s, x) => s + x.total, 0);
  const totalDebtSeller = debtBySeller.reduce((s, x) => s + x.debt, 0);

  const tripRows = fTrips.map(t => {
    const grossMargin = allSales
      .filter(d => String(d.trip_id || '') === String(t.id) && d.stage === 'facture')
      .reduce((s, d) => s + documentProfit(d).margin, 0);
    const charges = expenses
      .filter(e => String(e.trip_id || '') === String(t.id))
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    return { ...t, grossMargin, charges, net: grossMargin - charges };
  });
  const totalCharges = fExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalNet = tripRows.reduce((s, t) => s + t.net, 0);

  return (
    <>
      <Header title={L('reporting')}>
        <label className="text-xs text-slate-500 flex items-center gap-1">{L('dateFrom')}
          <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </label>
        <label className="text-xs text-slate-500 flex items-center gap-1">{L('dateTo')}
          <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </label>
        <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="btn bg-white border">{L('allPeriod')}</button>
        <button onClick={load} className="btn bg-white border">↻</button>
        {can('data.export') ? <button onClick={() => downloadCsv('reporting-commercial.csv', salesBySeller.map(x => ({ vendeur: x.name, ca: x.total, encaisse: x.paid, dette: x.debt, marge: x.margin, docs: x.docs })))} className="btn bg-slate-900 text-white">{L('exportReport') || L('exportCsv')}</button> : null}
      </Header>

      <div className="pro-kpi-grid mb-5">
        <div className="pro-kpi-card"><span>{L('salesBySeller')}</span><b>{dh(totalCA)}</b><small>{L('turnover')}</small></div>
        <div className="pro-kpi-card"><span>{L('debtBySeller')}</span><b>{dh(totalDebtSeller)}</b><small>{L('outstanding')}</small></div>
        <div className="pro-kpi-card"><span>{L('customerDebts')}</span><b>{dh(clientDebts.reduce((s,x)=>s+x.total,0))}</b><small>{L('totalDebt')}</small></div>
        <div className="pro-kpi-card"><span>{L('supplierDebts')}</span><b>{dh(supplierDebts.reduce((s,x)=>s+x.total,0))}</b><small>{L('totalDebt')}</small></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <SellerReportTable L={L} title={L('salesBySeller')} rows={salesBySeller} mode="sales" />
        <SellerReportTable L={L} title={L('debtBySeller')} rows={debtBySeller} mode="debt" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <DebtTable L={L} title={L('customerDebts')} rows={clientDebts} docs={fSales} type="clients" />
        <DebtTable L={L} title={L('supplierDebts')} rows={supplierDebts} docs={fPurchases} type="suppliers" />
      </div>

      <div className="card p-5 overflow-auto mb-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black">{L('expensesMod')}</h2>
          <div className="flex gap-4 text-sm">
            <span>{L('totalCharges')} : <b className="text-red-600">{dh(totalCharges)}</b></span>
            <span>{L('netMargin')} : <b className={totalNet >= 0 ? 'text-emerald-700' : 'text-red-700'}>{dh(totalNet)}</b></span>
          </div>
        </div>
        <table className="table w-full">
          <thead>
            <tr>
              <th>{L('tripNum')}</th><th>{L('tripLabel')}</th><th>{L('manager2')}</th>
              <th>{L('grossMarginLbl')}</th><th>{L('totalCharges')}</th><th>{L('netMargin')}</th>
            </tr>
          </thead>
          <tbody>
            {tripRows.map(t => (
              <tr key={t.id}>
                <td className="font-mono text-xs">{t.num_dep}</td>
                <td className="font-semibold">{t.label || '-'}</td>
                <td>{t.manager || '-'}</td>
                <td>{dh(t.grossMargin)}</td>
                <td className="text-red-600">{dh(t.charges)}</td>
                <td className={t.net >= 0 ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>{dh(t.net)}</td>
              </tr>
            ))}
            {!tripRows.length ? <tr><td colSpan="6">{L('noData')}</td></tr> : null}
          </tbody>
        </table>
      </div>

    </>
  );
}


function SellerReportTable({ L, title, rows, mode }) {
  return (
    <div className="card p-5 overflow-auto">
      <h2 className="text-lg font-black mb-4">{title}</h2>
      <table className="table w-full">
        <thead>
          <tr>
            <th>{L('seller')}</th>
            <th>{L('documentsCount')}</th>
            <th>{L('turnover')}</th>
            <th>{L('collected')}</th>
            <th>{L('outstanding')}</th>
            <th>{L('margin')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id || r.name}>
              <td className="font-semibold">{r.name}</td>
              <td>{r.docs}</td>
              <td className="font-bold">{dh(r.total)}</td>
              <td>{dh(r.paid)}</td>
              <td><Badge tone={r.debt > 0 ? 'amber' : 'green'}>{dh(r.debt)}</Badge></td>
              <td>{dh(r.margin)}</td>
            </tr>
          ))}
          {!rows.length ? <tr><td colSpan="6">{L('noData')}</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}


function buildStatement(docs, type, partyKey) {
  const matches = (docs || []).filter(d => {
    if (d.stage !== 'facture') return false;
    const key = type === 'clients' ? (d.client_id || d.client_name || 'unknown') : (d.supplier_id || d.supplier_name || 'unknown');
    return String(key) === String(partyKey);
  });
  const events = [];
  matches.forEach(d => {
    events.push({ date: d.date || '', ref: docNo(d), kind: 'facture', debit: Number(d.totalTTC || 0), credit: 0 });
    (d.paiements || jsonValue(d.payments_json, [])).filter(p => !p.canceled).forEach(p => {
      events.push({ date: p.date || d.date || '', ref: docNo(d), kind: p.mode || 'règlement', debit: 0, credit: Number(p.montant || 0) });
    });
  });
  events.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  let balance = 0;
  const lines = events.map(e => { balance += e.debit - e.credit; return { ...e, balance }; });
  const totalInvoiced = events.reduce((s, e) => s + e.debit, 0);
  const totalPaid = events.reduce((s, e) => s + e.credit, 0);
  return { lines, totalInvoiced, totalPaid, balance };
}

function StatementModal({ L, title, docs, type, party, close }) {
  const st = buildStatement(docs, type, party.id);
  return (
    <Modal title={L('statement') + ' — ' + party.name} onClose={close} wide>
      <div className="grid md:grid-cols-3 gap-3 mb-4 no-print">
        <div className="card p-3"><p className="text-xs text-slate-400">{L('totalInvoiced')}</p><p className="text-xl font-black">{dh(st.totalInvoiced)}</p></div>
        <div className="card p-3"><p className="text-xs text-slate-400">{L('totalPaid')}</p><p className="text-xl font-black text-emerald-700">{dh(st.totalPaid)}</p></div>
        <div className="card p-3"><p className="text-xs text-slate-400">{L('balanceDue')}</p><p className={'text-xl font-black ' + (st.balance > 0 ? 'text-red-700' : 'text-emerald-700')}>{dh(st.balance)}</p></div>
      </div>
      <div className="print-area">
        <table className="table w-full">
          <thead>
            <tr><th>{L('date')}</th><th>{L('ref')}</th><th>{L('paymentStatus') || 'Type'}</th><th>{L('totalInvoiced')}</th><th>{L('totalPaid')}</th><th>{L('balanceDue')}</th></tr>
          </thead>
          <tbody>
            {st.lines.map((e, i) => (
              <tr key={i}>
                <td>{e.date || '-'}</td>
                <td className="font-mono text-xs">{e.ref}</td>
                <td><Badge tone={e.debit ? 'amber' : 'green'}>{e.kind}</Badge></td>
                <td>{e.debit ? dh(e.debit) : '-'}</td>
                <td>{e.credit ? dh(e.credit) : '-'}</td>
                <td className="font-semibold">{dh(e.balance)}</td>
              </tr>
            ))}
            {!st.lines.length ? <tr><td colSpan="6">{L('noData')}</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-2 mt-4 no-print">
        <button onClick={() => window.print()} className="btn bg-slate-900 text-white">{L('print')}</button>
        <button onClick={close} className="btn bg-white border">{L('closeBtn')}</button>
      </div>
    </Modal>
  );
}

function DebtTable({ L, title, rows, docs, type }) {
  const [stmt, setStmt] = useState(null);
  return (
    <div className="card p-5 overflow-auto">
      <h2 className="text-lg font-black mb-4">{title}</h2>
      <table className="table w-full">
        <thead>
          <tr>
            <th>{L('name')}</th><th>{L('totalDebt') || 'Total dette'}</th><th>0-30</th><th>31-60</th><th>61-90</th><th>+90</th><th>Docs</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="font-semibold">{r.name}</td><td className="font-bold">{dh(r.total)}</td><td>{dh(r.due0_30)}</td><td>{dh(r.due31_60)}</td><td>{dh(r.due61_90)}</td><td>{dh(r.due90p)}</td><td>{r.docs}</td>
              <td>{docs ? <button onClick={() => setStmt(r)} className="btn bg-white border text-xs">{L('statement')}</button> : null}</td>
            </tr>
          ))}
          {!rows.length ? <tr><td colSpan="8">{L('noData')}</td></tr> : null}
        </tbody>
      </table>
      {stmt ? <StatementModal L={L} title={title} docs={docs} type={type} party={stmt} close={() => setStmt(null)} /> : null}
    </div>
  );
}

function ProfitCenter({ L }) {
  const [rows, setRows] = useState([]);
  const [docs, setDocs] = useState([]);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setErr('');
      const session = getStoredSession();
      const [{ data: prod, error: pErr }, { data: sales, error: sErr }] = await Promise.all([
        applyProductScope(supabase.from('products').select('*, branches(name)'), session).order('name'),
        applyDocScope(supabase.from('sales').select('*'), 'sales', session).order('date', { ascending: false })
      ]);
      if (pErr) throw pErr;
      if (sErr) throw sErr;
      setRows((prod || []).map(mapProduct));
      setDocs((sales || []).map(mapDoc));
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, []);

  if (err) return <ErrorBox msg={err} />;

  const lowMargin = rows.filter(p => productProfitStatus(p) !== 'healthy');
  const reorder = rows.map(p => ({ ...p, reorderQty: reorderSuggestion(p) })).filter(p => p.reorderQty > 0);
  const stockValue = rows.reduce((s, p) => s + Number(p.quantite || 0) * Number(p.prixAchat || 0), 0);
  const marginValue = rows.reduce((s, p) => s + (Number(p.prixVente || 0) - Number(p.prixAchat || 0)) * Number(p.quantite || 0), 0);

  return (
    <>
      <Header title={L('profitCenter')}>
        <button onClick={load} className="btn bg-white border">↻</button>
        {can('data.export') ? <button onClick={() => downloadCsv('rentabilite-produits.csv', rows.map(p => ({
          ref: p.ref,
          produit: p.nom,
          prix_achat: p.prixAchat,
          prix_vente: p.prixVente,
          marge_unitaire: Number(p.prixVente || 0) - Number(p.prixAchat || 0),
          taux_marge: p.prixVente ? ((p.prixVente - p.prixAchat) / p.prixVente) * 100 : 0,
          stock: p.quantite,
          qte_a_commander: reorderSuggestion(p)
        })))} className="btn bg-slate-900 text-white">{L('exportCsv')}</button> : null}
      </Header>

      <div className="pro-kpi-grid mb-5">
        <div className="pro-kpi-card"><span>{L('stockValue')}</span><b>{dh(stockValue)}</b><small>{L('valuation')}</small></div>
        <div className="pro-kpi-card"><span>{L('grossMargin')}</span><b>{dh(marginValue)}</b><small>{L('profitability')}</small></div>
        <div className="pro-kpi-card"><span>{L('profitAlerts')}</span><b>{lowMargin.length}</b><small>{L('marginRate')}</small></div>
        <div className="pro-kpi-card"><span>{L('reorderProposal')}</span><b>{reorder.length}</b><small>{L('lowStock')}</small></div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card pro-panel p-5 overflow-auto">
          <h2>{L('profitAlerts')}</h2>
          <table className="table w-full">
            <thead><tr><th>{L('ref')}</th><th>{L('product')}</th><th>{L('purchasePrice')}</th><th>{L('salePrice')}</th><th>{L('marginRate')}</th><th>{L('minimumSalePrice')}</th></tr></thead>
            <tbody>
              {lowMargin.map(p => {
                const rate = p.prixVente ? ((p.prixVente - p.prixAchat) / p.prixVente) * 100 : 0;
                return <tr key={p.id}>
                  <td>{p.ref}</td><td>{p.nom}</td><td>{dh(p.prixAchat)}</td><td>{dh(p.prixVente)}</td>
                  <td><Badge tone={rate < 10 ? 'red' : 'amber'}>{fmt(rate)}%</Badge></td>
                  <td className="font-bold">{dh(suggestSalePrice(p.prixAchat, 25))}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>

        <div className="card pro-panel p-5 overflow-auto">
          <h2>{L('reorderProposal')}</h2>
          <table className="table w-full">
            <thead><tr><th>{L('ref')}</th><th>{L('product')}</th><th>{L('stock')}</th><th>{L('minStock')}</th><th>{L('reorderQty')}</th><th>{L('valuation')}</th></tr></thead>
            <tbody>
              {reorder.map(p => <tr key={p.id}>
                <td>{p.ref}</td><td>{p.nom}</td><td>{fmt(p.quantite)}</td><td>{fmt(p.stockMin)}</td>
                <td><Badge tone="blue">{fmt(p.reorderQty)}</Badge></td><td>{dh(p.reorderQty * p.prixAchat)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}




// V50 : sauvegarde complète générée par la base (structure + données)
async function serverBackupAvailable() {
  const { data, error } = await supabase.rpc('app_backup_summary');
  if (error) {
    if (isMissingFunctionError(error) || /app_backup_summary|404|Could not find/i.test(error.message || '')) return { ok: false, summary: null };
    throw new Error(error.message);
  }
  return { ok: true, summary: data };
}

async function serverBackupSql(withData = true) {
  const { data, error } = await supabase.rpc('app_backup_sql', { p_with_data: withData });
  if (error) throw new Error(error.message);
  return data || '';
}

async function serverBackupJson() {
  const { data, error } = await supabase.rpc('app_backup_json');
  if (error) throw new Error(error.message);
  return data || { tables: {}, sequences: {} };
}

// V51 : sauvegarde en SQL normalisé (tout SGBD) — structure neutre + données
async function serverBackupMeta() {
  const { data, error } = await supabase.rpc('app_backup_meta');
  if (error) throw new Error(isMissingFunctionError(error) ? 'Exécutez MAJ_V51_SUPABASE.sql pour la sauvegarde SQL normalisée.' : error.message);
  return data || { tables: [] };
}

const SQL_DIALECTS = [
  { key: 'ansi', label: 'SQL standard (ANSI SQL:2003)', file: 'ANSI' },
  { key: 'mysql', label: 'MySQL / MariaDB', file: 'MySQL' },
  { key: 'sqlserver', label: 'Microsoft SQL Server', file: 'SQLServer' },
  { key: 'oracle', label: 'Oracle (12c et +)', file: 'Oracle' },
  { key: 'postgres', label: 'PostgreSQL', file: 'PostgreSQL' },
  { key: 'sqlite', label: 'SQLite', file: 'SQLite' }
];

// Nature d'une colonne PostgreSQL, indépendante du SGBD
function portableKind(col) {
  const b = String(col.base || '').toLowerCase();
  if (['int2', 'int4', 'int8'].includes(b)) return b === 'int8' ? 'bigint' : b === 'int2' ? 'smallint' : 'int';
  if (b === 'numeric') return 'numeric';
  if (['float4', 'float8'].includes(b)) return 'float';
  if (b === 'bool') return 'bool';
  if (b === 'date') return 'date';
  if (['timestamptz', 'timestamp'].includes(b)) return 'timestamp';
  if (b === 'time' || b === 'timetz') return 'time';
  if (b === 'json' || b === 'jsonb' || b.startsWith('_')) return 'json';
  if (b === 'uuid') return 'uuid';
  if (b === 'bytea') return 'binary';
  return 'text';
}

function portableQuote(name, d) {
  if (d === 'mysql') return '`' + String(name).replace(/`/g, '``') + '`';
  if (d === 'sqlserver') return '[' + String(name).replace(/]/g, ']]') + ']';
  if (d === 'oracle') return '"' + String(name).toUpperCase().replace(/"/g, '""') + '"';
  return '"' + String(name).replace(/"/g, '""') + '"';
}

// Noms de contraintes/index : 30 caractères au plus pour Oracle
function portableIdent(name, d) {
  let n = String(name);
  if (d === 'oracle' && n.length > 30) {
    let h = 0; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    n = n.slice(0, 23) + '_' + h.toString(36).slice(0, 6);
  }
  return portableQuote(n, d);
}

function portableType(col, d, ctx) {
  const k = portableKind(col);
  const m = /\((\d+)(?:,\s*(\d+))?\)/.exec(col.type || '');
  const p = m ? Number(m[1]) : null, s = m && m[2] !== undefined ? Number(m[2]) : null;
  const textLen = Math.max(255, Math.ceil((ctx.maxLen || 0) / 50) * 50);
  switch (k) {
    case 'smallint': return d === 'oracle' ? 'NUMBER(5)' : d === 'sqlite' ? 'INTEGER' : 'SMALLINT';
    case 'int': return d === 'oracle' ? 'NUMBER(10)' : 'INTEGER';
    case 'bigint': return d === 'oracle' ? 'NUMBER(19)' : d === 'sqlite' ? 'INTEGER' : 'BIGINT';
    case 'numeric': {
      const pp = p || 19, ss = s ?? (p ? 0 : 4);
      return d === 'oracle' ? `NUMBER(${pp},${ss})` : d === 'sqlite' ? 'NUMERIC' : `DECIMAL(${pp},${ss})`;
    }
    case 'float': return d === 'oracle' ? 'BINARY_DOUBLE' : d === 'sqlserver' ? 'FLOAT' : d === 'sqlite' ? 'REAL' : 'DOUBLE PRECISION';
    case 'bool': return d === 'mysql' ? 'TINYINT(1)' : d === 'sqlserver' ? 'BIT' : d === 'oracle' ? 'NUMBER(1)' : d === 'sqlite' ? 'INTEGER' : 'BOOLEAN';
    case 'date': return d === 'sqlite' ? 'TEXT' : 'DATE';
    case 'timestamp': return d === 'mysql' ? 'DATETIME(3)' : d === 'sqlserver' ? 'DATETIME2(3)' : d === 'sqlite' ? 'TEXT' : 'TIMESTAMP';
    case 'time': return d === 'oracle' ? 'VARCHAR2(20)' : d === 'sqlite' ? 'TEXT' : 'TIME';
    case 'uuid': return d === 'oracle' ? 'CHAR(36)' : d === 'sqlserver' ? 'CHAR(36)' : d === 'sqlite' ? 'TEXT' : d === 'postgres' ? 'UUID' : 'CHAR(36)';
    case 'binary': return d === 'mysql' ? 'LONGBLOB' : d === 'sqlserver' ? 'VARBINARY(MAX)' : d === 'oracle' ? 'BLOB' : d === 'sqlite' ? 'BLOB' : d === 'postgres' ? 'BYTEA' : 'BLOB';
    case 'json':
      return d === 'mysql' ? 'LONGTEXT' : d === 'sqlserver' ? 'NVARCHAR(MAX)' : d === 'oracle' ? 'CLOB' : d === 'sqlite' ? 'TEXT' : d === 'postgres' ? (col.base === 'json' ? 'JSON' : 'JSONB') : 'CLOB';
    default: {
      const declared = /character varying\((\d+)\)|character\((\d+)\)/.exec(col.type || '');
      const n = declared ? Number(declared[1] || declared[2]) : null;
      if (d === 'sqlite') return 'TEXT';
      if (d === 'postgres') return n ? `VARCHAR(${n})` : 'TEXT';
      if (ctx.indexed || n) {
        const len = Math.max(n || 0, textLen);
        if (d === 'sqlserver') return `NVARCHAR(${Math.min(len, 450)})`;
        if (d === 'oracle') return `VARCHAR2(${Math.min(len, 1000)} CHAR)`;
        return `VARCHAR(${d === 'mysql' ? Math.min(len, 768) : len})`;
      }
      if (d === 'mysql') return (ctx.maxLen || 0) > 16000 ? 'LONGTEXT' : 'TEXT';
      if (d === 'sqlserver') return 'NVARCHAR(MAX)';
      if (d === 'oracle') return (ctx.maxLen || 0) > 1000 ? 'CLOB' : 'VARCHAR2(4000 CHAR)';
      return (ctx.maxLen || 0) > 4000 ? 'CLOB' : 'VARCHAR(4000)';
    }
  }
}

function portableBool(v, d) {
  if (['sqlserver', 'oracle', 'sqlite'].includes(d)) return v ? '1' : '0';
  return v ? 'TRUE' : 'FALSE';
}

function portableString(str, d, col) {
  let s = String(str);
  if (d === 'oracle' && s === '' && col?.notnull) s = ' '; // Oracle : chaîne vide = NULL
  if (d === 'mysql') s = s.replace(/\\/g, '\\\\');
  s = s.replace(/'/g, "''");
  if (d === 'sqlserver') return "N'" + s + "'";
  if (d === 'oracle' && s.length > 1000) {
    const parts = [];
    for (let i = 0; i < s.length; i += 1000) {
      let chunk = s.slice(i, i + 1000);
      // ne pas couper une apostrophe doublée en deux
      if (chunk.endsWith("'") && !chunk.endsWith("''") && s[i + 1000] === "'") { chunk = s.slice(i, i + 1001); i += 1; }
      parts.push("TO_CLOB('" + chunk + "')");
    }
    return parts.join(' || ');
  }
  return "'" + s + "'";
}

function pad2(n) { return String(n).padStart(2, '0'); }

function portableTimestamp(v) {
  const dt = new Date(v);
  if (isNaN(dt.getTime())) return String(v);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())} ${pad2(dt.getUTCHours())}:${pad2(dt.getUTCMinutes())}:${pad2(dt.getUTCSeconds())}.${String(dt.getUTCMilliseconds()).padStart(3, '0')}`;
}

function portableValue(v, col, d) {
  if (v === null || v === undefined) return 'NULL';
  const k = portableKind(col);
  if (['smallint', 'int', 'bigint', 'numeric', 'float'].includes(k)) {
    const s = String(v);
    return /^-?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(s) ? s : 'NULL';
  }
  if (k === 'bool') return portableBool(v === true || v === 't' || v === 'true' || v === 1, d);
  if (k === 'date') {
    const s = String(v).slice(0, 10);
    return ['ansi', 'oracle', 'postgres'].includes(d) ? `DATE '${s}'` : `'${s}'`;
  }
  if (k === 'timestamp') {
    const s = portableTimestamp(v);
    if (['ansi', 'oracle', 'postgres'].includes(d)) return `TIMESTAMP '${s}'`;
    if (d === 'sqlserver') return `'${s.replace(' ', 'T')}'`;
    return `'${s}'`;
  }
  if (k === 'json') return portableString(typeof v === 'string' ? v : JSON.stringify(v), d, col);
  if (k === 'binary') return portableString(String(v), d, col);
  return portableString(typeof v === 'object' ? JSON.stringify(v) : v, d, col);
}

function portableDefault(col, d, typeStr = '') {
  const def = String(col.default || '').trim();
  if (!def || col.identity) return '';
  const k = portableKind(col);
  if (/^(now\(\)|CURRENT_TIMESTAMP|transaction_timestamp\(\))$/i.test(def)) {
    if (k !== 'timestamp') return '';
    return d === 'mysql' ? ' DEFAULT CURRENT_TIMESTAMP(3)' : ' DEFAULT CURRENT_TIMESTAMP';
  }
  if (/^CURRENT_DATE$/i.test(def)) {
    if (d === 'mysql') return '';
    if (d === 'sqlserver') return ' DEFAULT CONVERT(date, GETDATE())';
    return ' DEFAULT CURRENT_DATE';
  }
  if (def === 'true' || def === 'false') return ' DEFAULT ' + portableBool(def === 'true', d);
  const num = /^\(?'?(-?\d+(?:\.\d+)?)'?(?:::[\w\s]+)?\)?$/.exec(def);
  if (num && ['smallint', 'int', 'bigint', 'numeric', 'float'].includes(k)) return ' DEFAULT ' + num[1];
  const str = /^'((?:[^']|'')*)'(?:::[\w\s"]+)?$/.exec(def);
  if (str) {
    if (d === 'mysql' && /TEXT|BLOB/.test(typeStr)) return ''; // MySQL : pas de valeur par défaut sur TEXT
    const raw = str[1].replace(/''/g, "'");
    return ' DEFAULT ' + portableString(raw, d === 'oracle' ? 'ansi' : d, null);
  }
  return ''; // fonction propre à PostgreSQL : pas de valeur par défaut portable
}

function portableOrder(tables) {
  const byName = Object.fromEntries(tables.map(t => [t.name, t]));
  const done = new Set(), visiting = new Set(), out = [];
  const visit = t => {
    if (done.has(t.name) || visiting.has(t.name)) return;
    visiting.add(t.name);
    for (const fk of t.fks || []) if (fk.refTable !== t.name && byName[fk.refTable]) visit(byName[fk.refTable]);
    visiting.delete(t.name); done.add(t.name); out.push(t);
  };
  [...tables].sort((a, b) => a.name.localeCompare(b.name)).forEach(visit);
  return out;
}

const PORTABLE_EXCLUDED_DATA = ['app_sessions'];

function buildPortableSql(meta, data, d, opts = {}) {
  const q = n => portableQuote(n, d);
  const tables = portableOrder((meta.tables || []).filter(t => (t.columns || []).length));
  const rowsOf = t => (PORTABLE_EXCLUDED_DATA.includes(t.name) ? [] : (data?.tables?.[t.name] || []));
  const label = SQL_DIALECTS.find(x => x.key === d)?.label || d;
  const L = [];
  const nowTxt = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  let totalRows = 0;
  L.push('-- =====================================================================');
  L.push('-- DrogueriePro — SAUVEGARDE SQL NORMALISÉE');
  L.push('-- SGBD cible : ' + label);
  L.push('-- Date : ' + nowTxt + (opts.company ? ' · ' + opts.company : ''));
  L.push('-- Contenu : structure (tables, colonnes, clés primaires, uniques, étrangères, index) + données.');
  L.push('-- Non portables, donc non inclus : fonctions, déclencheurs et règles de sécurité PostgreSQL');
  L.push('-- (pour une restauration Supabase à l\'identique, utilisez la « Sauvegarde complète (SQL) »).');
  L.push('-- =====================================================================');
  L.push('');
  if (d === 'mysql') L.push('SET NAMES utf8mb4;', 'SET FOREIGN_KEY_CHECKS = 0;', "SET SESSION sql_mode = REPLACE(@@SESSION.sql_mode, 'NO_BACKSLASH_ESCAPES', '');", '');
  if (d === 'sqlserver') L.push('SET NOCOUNT ON;', '');
  if (d === 'oracle') L.push('SET DEFINE OFF;', '');
  if (d === 'sqlite') L.push('PRAGMA foreign_keys = OFF;', '');

  // Colonnes indexées (pour dimensionner les textes)
  const indexedCols = t => new Set([...(t.pk || []), ...(t.uniques || []).flatMap(u => u.cols || []), ...(t.fks || []).flatMap(f => f.cols || []), ...(t.indexes || []).flatMap(i => i.cols || [])]);
  const maxLen = (t, c) => rowsOf(t).reduce((m, r) => { const v = r[c]; if (v === null || v === undefined) return m; const s = typeof v === 'object' ? JSON.stringify(v) : String(v); return Math.max(m, s.length); }, 0);

  L.push('-- ---------- 1. Tables ----------');
  for (const t of tables) {
    const idx = indexedCols(t);
    const pk = t.pk || [];
    const lines = [];
    let inlinePk = false;
    for (const c of t.columns) {
      const ctx = { indexed: idx.has(c.name), maxLen: maxLen(t, c.name) };
      let line = '  ' + q(c.name) + ' ';
      if (d === 'sqlite' && c.identity && pk.length === 1 && pk[0] === c.name) { line += 'INTEGER PRIMARY KEY'; inlinePk = true; lines.push(line); continue; }
      const typeStr = portableType(c, d, ctx);
      line += typeStr;
      if (c.identity) {
        if (d === 'mysql') line += ' AUTO_INCREMENT';
        else if (d === 'sqlserver') line += ' IDENTITY(1,1)';
        else if (d !== 'sqlite') line += ' GENERATED BY DEFAULT AS IDENTITY';
      } else {
        line += portableDefault(c, d, typeStr);
      }
      if (c.notnull || pk.includes(c.name)) line += ' NOT NULL';
      lines.push(line);
    }
    if (pk.length && !inlinePk) lines.push('  CONSTRAINT ' + portableIdent(t.name + '_pkey', d) + ' PRIMARY KEY (' + pk.map(q).join(', ') + ')');
    for (const u of t.uniques || []) lines.push('  CONSTRAINT ' + portableIdent(u.name, d) + ' UNIQUE (' + u.cols.map(q).join(', ') + ')');
    if (d === 'sqlite') {
      for (const f of t.fks || []) lines.push('  CONSTRAINT ' + q(f.name) + ' FOREIGN KEY (' + f.cols.map(q).join(', ') + ') REFERENCES ' + q(f.refTable) + ' (' + f.refCols.map(q).join(', ') + ')' + (f.onDelete === 'c' ? ' ON DELETE CASCADE' : f.onDelete === 'n' ? ' ON DELETE SET NULL' : ''));
    }
    L.push('CREATE TABLE ' + q(t.name) + ' (', lines.join(',\n'), ')' + (d === 'mysql' ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4' : '') + ';', '');
  }

  L.push('-- ---------- 2. Données ----------');
  if (d === 'mysql' || d === 'ansi') L.push('START TRANSACTION;');
  else if (d === 'sqlserver') L.push('BEGIN TRANSACTION;');
  else if (d === 'sqlite' || d === 'postgres') L.push('BEGIN;');
  for (const t of tables) {
    const rows = rowsOf(t);
    L.push('', `-- ${t.name} : ${rows.length} ligne(s)` + (PORTABLE_EXCLUDED_DATA.includes(t.name) ? ' (sessions de connexion non sauvegardées)' : ''));
    if (!rows.length) continue;
    totalRows += rows.length;
    const cols = t.columns;
    const hasIdentity = cols.some(c => c.identity);
    if (d === 'sqlserver' && hasIdentity) L.push('SET IDENTITY_INSERT ' + q(t.name) + ' ON;');
    const head = 'INSERT INTO ' + q(t.name) + ' (' + cols.map(c => q(c.name)).join(', ') + ') VALUES ';
    for (const r of rows) L.push(head + '(' + cols.map(c => portableValue(r[c.name], c, d)).join(', ') + ');');
    if (d === 'sqlserver' && hasIdentity) L.push('SET IDENTITY_INSERT ' + q(t.name) + ' OFF;');
  }
  L.push('', 'COMMIT;', '');

  // Compteurs automatiques : reprendre après le plus grand identifiant
  L.push('-- ---------- 3. Compteurs automatiques ----------');
  for (const t of tables) {
    for (const c of t.columns.filter(x => x.identity)) {
      const next = rowsOf(t).reduce((m, r) => Math.max(m, Number(r[c.name] || 0)), 0) + 1;
      if (next <= 1) continue;
      if (d === 'mysql') L.push(`ALTER TABLE ${q(t.name)} AUTO_INCREMENT = ${next};`);
      else if (d === 'sqlserver') L.push(`DBCC CHECKIDENT ('${t.name}', RESEED, ${next - 1});`);
      else if (d === 'oracle') L.push(`ALTER TABLE ${q(t.name)} MODIFY (${q(c.name)} GENERATED BY DEFAULT AS IDENTITY (START WITH ${next}));`);
      else if (d !== 'sqlite') L.push(`ALTER TABLE ${q(t.name)} ALTER COLUMN ${q(c.name)} RESTART WITH ${next};`);
    }
  }
  L.push('');

  if (d !== 'sqlite') {
    L.push('-- ---------- 4. Clés étrangères ----------');
    for (const t of tables) {
      for (const f of t.fks || []) {
        let act = '';
        if (f.onDelete === 'c') act = d === 'sqlserver' ? '' : ' ON DELETE CASCADE';
        if (f.onDelete === 'n') act = d === 'sqlserver' ? '' : ' ON DELETE SET NULL';
        L.push(`ALTER TABLE ${q(t.name)} ADD CONSTRAINT ${portableIdent(f.name, d)} FOREIGN KEY (${f.cols.map(q).join(', ')}) REFERENCES ${q(f.refTable)} (${f.refCols.map(q).join(', ')})${act};`);
      }
    }
    if (d === 'sqlserver') L.push('-- SQL Server : les suppressions en cascade sont gérées par l\'application (NO ACTION).');
    L.push('');
  }

  L.push('-- ---------- 5. Index ----------');
  for (const t of tables) {
    for (const i of t.indexes || []) {
      if (i.expression || !(i.cols || []).length) { L.push(`-- Index non portable ignoré (${i.name}) : ${i.definition || ''}`); continue; }
      L.push(`CREATE ${i.unique ? 'UNIQUE ' : ''}INDEX ${portableIdent(i.name, d)} ON ${q(t.name)} (${i.cols.map(q).join(', ')});`);
    }
  }
  if (d === 'mysql') L.push('', 'SET FOREIGN_KEY_CHECKS = 1;');
  if (d === 'sqlite') L.push('', 'PRAGMA foreign_keys = ON;');
  L.push('', `-- Fin : ${tables.length} tables, ${totalRows} lignes.`);
  return L.join('\n') + '\n';
}

function BackupCenter({ L }) {
  const [busy, setBusy] = useState('');
  const [server, setServer] = useState(null);
  const [err, setErr] = useState('');
  const [legacy, setLegacy] = useState(null);
  const [lastAt, setLastAt] = useState(() => { try { return localStorage.getItem('droguerie_last_backup') || ''; } catch { return ''; } });
  const [dialect, setDialect] = useState(() => { try { return localStorage.getItem('droguerie_backup_dialect') || 'ansi'; } catch { return 'ansi'; } });
  const stamp = () => today() + '_' + new Date().toTimeString().slice(0, 5).replace(':', 'h');

  async function load() {
    try { setErr(''); setServer(await serverBackupAvailable()); } catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  function done() {
    const at = new Date().toLocaleString('fr-FR');
    try { localStorage.setItem('droguerie_last_backup', at); } catch {}
    setLastAt(at);
    auditLog('Sauvegarde', 'EXPORT', 'Sauvegarde base', at).catch(() => {});
  }

  async function run(kind, fn) {
    try { setBusy(kind); await fn(); done(); } catch (e) { alert(e.message); } finally { setBusy(''); }
  }

  const fullSql = () => run('sql', async () => downloadTextFile('DrogueriePro_Sauvegarde_Complete_' + stamp() + '.sql', await serverBackupSql(true), 'text/sql;charset=utf-8'));
  const schemaSql = () => run('schema', async () => downloadTextFile('DrogueriePro_Structure_' + stamp() + '.sql', await serverBackupSql(false), 'text/sql;charset=utf-8'));
  const fullJson = () => run('json', async () => {
    const [schemaSqlText, data] = await Promise.all([serverBackupSql(false), serverBackupJson()]);
    const backup = { app: 'DrogueriePro', version: 'V50', createdAt: new Date().toISOString(), structureSql: schemaSqlText, sequences: data.sequences, tables: data.tables };
    downloadTextFile('DrogueriePro_Sauvegarde_' + stamp() + '.json', JSON.stringify(backup, null, 2), 'application/json;charset=utf-8');
  });
  const csvAll = () => run('csv', async () => {
    const data = await serverBackupJson();
    for (const [table, rows] of Object.entries(data.tables || {})) {
      if (Array.isArray(rows) && rows.length) downloadCsv('DrogueriePro_' + table + '_' + today() + '.csv', rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v !== null && typeof v === 'object' ? JSON.stringify(v) : v]))));
    }
  });

  // SQL normalisé : rejouable dans un autre SGBD (MySQL, SQL Server, Oracle, SQLite, PostgreSQL ou SQL standard)
  const portableSql = () => run('portable', async () => {
    try { localStorage.setItem('droguerie_backup_dialect', dialect); } catch {}
    const [meta, data, company] = await Promise.all([serverBackupMeta(), serverBackupJson(), loadCompanySettings().catch(() => null)]);
    const sql = buildPortableSql(meta, data, dialect, { company: company?.name || '' });
    const f = SQL_DIALECTS.find(x => x.key === dialect)?.file || dialect;
    downloadTextFile('DrogueriePro_Sauvegarde_' + f + '_' + stamp() + '.sql', sql, 'text/sql;charset=utf-8');
  });

  // Ancien mode (script V50 non exécuté) : données des tables principales seulement
  const legacyJson = () => run('legacy', async () => {
    const backup = await buildFullBackup();
    setLegacy(backup);
    downloadTextFile('DrogueriePro_Donnees_' + stamp() + '.json', JSON.stringify(backup, null, 2), 'application/json;charset=utf-8');
  });
  const legacySql = () => run('legacy', async () => {
    const backup = await buildFullBackup();
    setLegacy(backup);
    downloadTextFile('DrogueriePro_Donnees_' + stamp() + '.sql', backupToSql(backup), 'text/sql;charset=utf-8');
  });

  if (err) return <ErrorBox msg={err} />;
  if (!server) return <div className="card p-6 text-slate-500">…</div>;
  const sm = server.summary || {};
  const rows = sm.rows || {};
  const totalRows = Object.values(rows).reduce((a, n) => a + Number(n || 0), 0);

  return (
    <>
      <Header title={L('backupCenter')}>
        <button onClick={load} className="btn bg-white border">↻</button>
      </Header>

      <div className="pro-hero mb-5">
        <div>
          <div className="pro-eyebrow">DrogueriePro · {L('fullBackup')}</div>
          <h1>{L('bkTitle')}</h1>
          <p>{L('bkIntro')}</p>
          {lastAt ? <p className="text-sm mt-2">{L('bkLast')} : <b>{lastAt}</b></p> : null}
        </div>
        <div className="pro-hero-score">
          <span>{L('backupTables')}</span>
          <b>{server.ok ? sm.tables : BACKUP_TABLES.length}</b>
        </div>
      </div>

      {!server.ok ? (
        <div className="card p-4 mb-5 bg-amber-50 border-amber-200 text-amber-800 text-sm">{L('bkNeedSql')}</div>
      ) : null}

      {server.ok ? (
        <>
          <div className="grid md:grid-cols-6 gap-3 mb-5">
            {[['tables', L('bkTables')], ['constraints', L('bkConstraints')], ['indexes', L('bkIndexes')], ['functions', L('bkFunctions')], ['policies', L('bkPolicies')]].map(([k, t]) => (
              <div key={k} className="pro-kpi-card"><span>{t}</span><b>{sm[k] ?? 0}</b><small>{L('bkStructure')}</small></div>
            ))}
            <div className="pro-kpi-card"><span>{L('recordsCount')}</span><b>{Number(totalRows).toLocaleString('fr-FR')}</b><small>{L('bkData')}</small></div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <div className="card p-5 border-amber-400" style={{ borderWidth: 2 }}>
              <h2 className="font-black mb-1">🗄️ {L('bkFullSql')}</h2>
              <p className="text-sm text-slate-500">{L('bkFullSqlHint')}</p>
              <button disabled={!!busy} onClick={fullSql} className="btn bg-amber-500 mt-4 w-full">{busy === 'sql' ? '…' : L('downloadBackup')}</button>
            </div>
            <div className="card p-5">
              <h2 className="font-black mb-1">🧱 {L('bkSchemaSql')}</h2>
              <p className="text-sm text-slate-500">{L('bkSchemaSqlHint')}</p>
              <button disabled={!!busy} onClick={schemaSql} className="btn bg-slate-900 text-white mt-4 w-full">{busy === 'schema' ? '…' : L('downloadBackup')}</button>
            </div>
            <div className="card p-5 md:col-span-2 border-sky-400" style={{ borderWidth: 2 }}>
              <h2 className="font-black mb-1">🌐 {L('bkPortable')}</h2>
              <p className="text-sm text-slate-500">{L('bkPortableHint')}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <select className="input" style={{ maxWidth: 320 }} value={dialect} onChange={e => setDialect(e.target.value)}>
                  {SQL_DIALECTS.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
                </select>
                <button disabled={!!busy} onClick={portableSql} className="btn bg-sky-600 text-white">{busy === 'portable' ? '…' : L('downloadBackup')}</button>
              </div>
              <p className="text-xs text-slate-400 mt-2">{L('bkPortableNote')}</p>
            </div>
            <div className="card p-5">
              <h2 className="font-black mb-1">{L('backupJson')}</h2>
              <p className="text-sm text-slate-500">{L('bkJsonHint')}</p>
              <button disabled={!!busy} onClick={fullJson} className="btn bg-white border mt-4 w-full">{busy === 'json' ? '…' : L('downloadBackup')}</button>
            </div>
            <div className="card p-5">
              <h2 className="font-black mb-1">{L('backupCsv')}</h2>
              <p className="text-sm text-slate-500">{L('bkCsvHint')}</p>
              <button disabled={!!busy} onClick={csvAll} className="btn bg-white border mt-4 w-full">{busy === 'csv' ? '…' : L('exportAll')}</button>
            </div>
          </div>

          <div className="card p-5 overflow-auto mb-5">
            <h2 className="font-black mb-3">{L('backupTables')}</h2>
            <table className="table w-full">
              <thead><tr><th>{L('tableName')}</th><th>{L('recordsCount')}</th><th>{L('bkIncluded')}</th></tr></thead>
              <tbody>
                {Object.entries(rows).sort((a, b) => a[0].localeCompare(b[0])).map(([t, n]) => (
                  <tr key={t}>
                    <td className="font-mono">{t}</td>
                    <td>{Number(n || 0).toLocaleString('fr-FR')}</td>
                    <td>{t === 'app_sessions' ? <Badge tone="slate">{L('bkStructureOnly')}</Badge> : <Badge tone="green">{L('bkStructure')} + {L('bkData')}</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div className="card p-5">
            <h2 className="font-black mb-2">{L('backupJson')}</h2>
            <p className="text-sm text-slate-500">{L('bkLegacyHint')}</p>
            <button disabled={!!busy} onClick={legacyJson} className="btn bg-slate-900 text-white mt-4 w-full">{L('downloadBackup')}</button>
          </div>
          <div className="card p-5">
            <h2 className="font-black mb-2">{L('backupSql')}</h2>
            <p className="text-sm text-slate-500">{L('bkLegacyHint')}</p>
            <button disabled={!!busy} onClick={legacySql} className="btn bg-amber-500 mt-4 w-full">{L('downloadBackup')}</button>
          </div>
          {legacy ? <div className="card p-4 md:col-span-2 text-sm">{legacy.tables.map(t => t.table + ' (' + (t.rows ? t.rows.length : 0) + ')').join(' · ')}</div> : null}
        </div>
      )}

      <div className="card p-5 text-sm text-slate-600 space-y-2">
        <b>{L('restoreNote')}</b>
        <ol className="list-decimal ps-5 space-y-1">
          <li>{L('bkRestore1')}</li>
          <li>{L('bkRestore2')}</li>
          <li>{L('bkRestore3')}</li>
        </ol>
        <p className="text-xs text-slate-500">{L('bkSecurity')}</p>
      </div>
    </>
  );
}

function SuperAdminCenter({ L }) {
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState([]);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setErr('');
      const [m, s] = await Promise.all([loadSaasModules(), loadDbStats()]);
      setModules(m);
      setStats(s);
      const disabled = (m || []).filter(x => x.enabled === false).map(x => x.code);
      localStorage.setItem('droguerie_disabled_modules', JSON.stringify(disabled));
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleModule(mod) {
    try {
      await saveSaasModule({ ...mod, enabled: !mod.enabled });
      const disabled = await refreshSaasModulesCache();
      window.dispatchEvent(new CustomEvent('droguerie_modules_changed', { detail: disabled }));
      await load();
    } catch (e) { alert(e.message); }
  }

  async function updatePrice(mod, field, value) {
    try {
      await saveSaasModule({ ...mod, [field]: Number(value || 0) });
      await load();
    } catch (e) { alert(e.message); }
  }

  if (err) return <ErrorBox msg={err} />;

  return (
    <>
      <Header title={L('saasCenter')}>
        <button onClick={load} className="btn bg-white border">↻</button>
      </Header>

      <div className="grid md:grid-cols-4 gap-4 mb-5">
        <div className="pro-kpi-card"><span>{L('modulesCenter')}</span><b>{modules.length}</b><small>{L('moduleBilling')}</small></div>
        <div className="pro-kpi-card"><span>{L('enabled')}</span><b>{modules.filter(m => m.enabled).length}</b><small>{L('subscription')}</small></div>
        <div className="pro-kpi-card"><span>{L('disabled')}</span><b>{modules.filter(m => !m.enabled).length}</b><small>{L('plan')}</small></div>
        <div className="pro-kpi-card"><span>{L('databaseCenter')}</span><b>{stats.length}</b><small>{L('databaseStats')}</small></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-5 overflow-auto lg:col-span-2">
          <h2 className="text-lg font-black mb-4">{L('modulesCenter')}</h2>
          <table className="table w-full">
            <thead>
              <tr>
                <th>{L('moduleCode')}</th>
                <th>{L('moduleName')}</th>
                <th>Type</th>
                <th>{L('monthlyPrice')}</th>
                <th>{L('yearlyPrice')}</th>
                <th>{L('enabled')}</th>
              </tr>
            </thead>
            <tbody>
              {modules.map(m => (
                <tr key={m.code}>
                  <td className="font-mono text-xs">{m.code}</td>
                  <td><div className="font-semibold">{m.name}</div>{m.description ? <div className="text-xs text-slate-500">{m.description}</div> : null}</td>
                  <td className="whitespace-nowrap">{['branches', 'users', 'mobileApp', 'attachments'].includes(m.code) ? <Badge tone="blue">{L('platformModules')}</Badge> : <Badge tone="slate">{L('businessModules')}</Badge>}</td>
                  <td><input className="input max-w-xs" type="number" defaultValue={m.monthly_price || 0} onBlur={e => updatePrice(m, 'monthly_price', e.target.value)} /></td>
                  <td><input className="input max-w-xs" type="number" defaultValue={m.yearly_price || 0} onBlur={e => updatePrice(m, 'yearly_price', e.target.value)} /></td>
                  <td>
                    <button onClick={() => toggleModule(m)} className={m.enabled ? 'btn bg-emerald-600 text-white' : 'btn bg-red-600 text-white'}>
                      {m.enabled ? L('enabled') : L('disabled')}
                    </button>
                  </td>
                </tr>
              ))}
              {!modules.length ? <tr><td colSpan="6">{L('noData')}</td></tr> : null}
            </tbody>
          </table>
        </div>

        <div className="card p-5 overflow-auto">
          <h2 className="text-lg font-black mb-4">{L('databaseStats')}</h2>
          <table className="table w-full">
            <thead><tr><th>{L('tableName')}</th><th>{L('recordsCount')}</th></tr></thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.table}>
                  <td className="font-mono">{s.table}</td>
                  <td className="font-bold">{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}


function Dashboard({ L }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setErr('');
      setData(await loadProDashboardData());
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  if (err) return <ErrorBox msg={err} />;
  if (!data) return <p>Chargement...</p>;

  const k = data.kpis;
  const recent = data.movements.slice(0, 6);
  const lowProducts = data.products.filter(p => isLowStockAlert(p)).slice(0, 6);
  const expiringProducts = data.products.filter(p => isExpiryAlert(p)).sort((a, b) => String(a.datePeremption).localeCompare(String(b.datePeremption))).slice(0, 6);
  const overdueDocs = data.sales.filter(d => isOverdueInvoice(d)).slice(0, 6);
  const alertCfg = getAlertSettings();
  const topProducts = [...data.products]
    .sort((a, b) => Number(b.quantite || 0) * Number(b.prixVente || 0) - Number(a.quantite || 0) * Number(a.prixVente || 0))
    .slice(0, 5);

  return (
    <>
      <Header title={L('dashboard')}>
        <button onClick={load} className="btn bg-white border">↻</button>
        {can('data.export') ? <button onClick={() => downloadCsv('drogueriepro-produits.csv', data.products.map(p => ({ ref: p.ref, nom: p.nom, stock: p.quantite, prix_achat: p.prixAchat, prix_vente: p.prixVente, droguerie: p.branchName })))} className="btn bg-slate-900 text-white">
          {L('exportCsv')}
        </button> : null}
      </Header>

      <div className="pro-hero mb-6">
        <div>
          <div className="pro-eyebrow">DrogueriePro · {L('proMode')}</div>
          <h1>{L('businessHealth')}</h1>
          <p>{L('performance')} stock, ventes, achats, paiements et alertes opérationnelles.</p>
        </div>
        <div className="pro-hero-score">
          <span>{k.stockAlerts > 0 || k.expiryAlerts > 0 || k.overdueInvoices > 0 ? L('warning') : L('healthy')}</span>
          <b>{k.stockAlerts + (k.expiryAlerts || 0) + (k.overdueInvoices || 0)}</b>
        </div>
      </div>

      <div className="pro-kpi-grid pro-kpi-grid-v38 mb-6">
        <div className="pro-kpi-card"><span>{L('todaySales')}</span><b>{dh(k.todaySales)}</b><small>{L('sales')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiRevenue')}</span><b>{dh(k.salesTotal || 0)}</b><small>{L('sales')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiPurchases')}</span><b>{dh(k.purchasesTotal || 0)}</b><small>{L('purchases')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiCashIn')}</span><b>{dh(k.cashInTotal || 0)}</b><small>{L('cashIn')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiCashOut')}</span><b>{dh(k.cashOutTotal || 0)}</b><small>{L('cashOut')}</small></div>
        <div className="pro-kpi-card"><span>{L('stockValue')}</span><b>{dh(k.stockValue)}</b><small>{L('valuation')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiStockQty')}</span><b>{fmt(k.stockQty || 0)}</b><small>{L('stock')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiOpenDocs')}</span><b>{k.openDocs || 0}</b><small>{L('document')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiPaidRate')}</span><b>{fmt(k.paidRate || 0)}%</b><small>{L('payments')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiLowMargin')}</span><b>{k.lowMargin || 0}</b><small>{L('profitability')}</small></div>
        <div className="pro-kpi-card"><span>{L('unpaidInvoices')}</span><b>{k.unpaidInvoices}</b><small>{L('risk')}</small></div>
        <div className="pro-kpi-card"><span>{L('stockAlerts')}</span><b>{k.stockAlerts}</b><small>{L('critical')}</small></div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-500 mb-2">{isSystemAdmin(getStoredSession()) ? L('myActivityAll') : L('myActivity')}</h2>
        <div className="pro-kpi-grid pro-kpi-grid-v38">
          <div className="pro-kpi-card"><span>{L('trips')}</span><b>{k.myTripsCount || 0}</b><small>{L('expensesMod')}</small></div>
          <div className="pro-kpi-card"><span>{L('totalCharges')}</span><b>{dh(k.myChargesTotal || 0)}</b><small>{L('charges')}</small></div>
          <div className="pro-kpi-card"><span>{L('netMargin')}</span><b>{dh(k.myTripNetMargin || 0)}</b><small>{L('tripMargin')}</small></div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="card pro-panel p-5">
          <h2>{L('alerts')}</h2>
          {alertCfg.stock ? <div className="text-xs font-bold text-slate-500 mt-1 mb-1">{L('stockAlerts')}</div> : null}
          {alertCfg.stock && lowProducts.map(p => (
            <div key={'s' + p.id} className="pro-alert-row">
              <div><b>{p.nom}</b><p>{p.ref} · {p.branchName || '-'}</p></div>
              <Badge tone="red">{fmt(p.quantite)} / {fmt(p.stockMin)}</Badge>
            </div>
          ))}
          {alertCfg.expiry && expiringProducts.length ? <div className="text-xs font-bold text-slate-500 mt-3 mb-1">{L('expiringProducts')} (≤ {alertCfg.expiryDays} j)</div> : null}
          {alertCfg.expiry && expiringProducts.map(p => (
            <div key={'e' + p.id} className="pro-alert-row">
              <div><b>{p.nom}</b><p>{p.ref} · {p.branchName || '-'}</p></div>
              <Badge tone="amber">{p.datePeremption}</Badge>
            </div>
          ))}
          {alertCfg.unpaid && overdueDocs.length ? <div className="text-xs font-bold text-slate-500 mt-3 mb-1">{L('overdueInvoices')} (&gt; {alertCfg.unpaidDays} j)</div> : null}
          {alertCfg.unpaid && overdueDocs.map(d => (
            <div key={'u' + d.id} className="pro-alert-row">
              <div><b>{d.client_name || '-'}</b><p>{docNo(d)} · {d.date}</p></div>
              <Badge tone="red">{dh(d.reste)}</Badge>
            </div>
          ))}
          {!(alertCfg.stock && lowProducts.length) && !(alertCfg.expiry && expiringProducts.length) && !(alertCfg.unpaid && overdueDocs.length) ? <p className="text-sm text-slate-500">{L('noData')}</p> : null}
        </div>

        <div className="card pro-panel p-5">
          <h2>{L('recentActivity')}</h2>
          {recent.length ? recent.map(m => (
            <div key={m.id} className="pro-activity-row">
              <span className={Number(m.quantity) >= 0 ? 'pro-dot-in' : 'pro-dot-out'} />
              <div><b>{m.productName || '-'}</b><p>{m.reason || '-'} · {fmt(m.quantity)}</p></div>
            </div>
          )) : <p className="text-sm text-slate-500">{L('noData')}</p>}
        </div>

        <div className="card pro-panel p-5">
          <h2>{L('topProducts')}</h2>
          {topProducts.length ? topProducts.map(p => (
            <div key={p.id} className="pro-top-row">
              <div><b>{p.nom}</b><p>{p.ref} · {fmt(p.quantite)} {p.unite}</p></div>
              <strong>{dh(Number(p.quantite || 0) * Number(p.prixVente || 0))}</strong>
            </div>
          )) : <p className="text-sm text-slate-500">{L('noData')}</p>}
        </div>
      </div>
    </>
  );
}

function Products({ L }) {
  const canWriteProduct = can('products.write');
  const canDeleteProduct = can('products.delete');
  const canAdjustStock = can('stock.adjust');
  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState(null);
  const [stock, setStock] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [branchFilter, setBranchFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [lists, setLists] = useState({ categories: [], units: [], dbReady: false });
  const [showLists, setShowLists] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    try {
      const session = getStoredSession();
      const [{ data, error }, branchData, stockSummary, listData] = await Promise.all([
        applyProductScope(supabase.from('products').select('*, branches(name)'), session).order('name'),
        loadBranches(),
        loadBranchStockSummary(),
        loadProductLists(),
        loadSettings().catch(() => null)
      ]);
      loadParties('suppliers').then(x => setSuppliers(x || [])).catch(() => setSuppliers([]));
      if (error) throw error;
      setRows((data || []).map(mapProduct));
      setBranches(branchData || []);
      setSummary(stockSummary || []);
      setLists(listData);
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, []);

  const visibleRows = (branchFilter === 'all'
    ? rows
    : rows.filter(p => String(p.branchId || '') === String(branchFilter)))
    .filter(p => catFilter === 'all' || String(p.categorie || '') === String(catFilter))
    .filter(p => !search || [p.ref, p.nom, p.nomAr, p.categorie, p.branchName, p.barcode].join(' ').toLowerCase().includes(search.toLowerCase()));

  const categoryOptions = Array.from(new Set([...lists.categories.map(c => c.name), ...rows.map(p => p.categorie).filter(Boolean)])).sort();

  const totalQty = visibleRows.reduce((s, p) => s + Number(p.quantite || 0), 0);
  const stockValue = visibleRows.reduce((s, p) => s + Number(p.quantite || 0) * Number(p.prixAchat || 0), 0);
  const lowStock = visibleRows.filter(p => isLowStockAlert(p)).length;

  async function save() {
    try {
      requirePerm('products.write', 'Gestion produits');

      // Prix d'achat (PMP) et quantité ne sont jamais saisis ici :
      // ils sont gérés par les achats, ventes et mouvements de stock.
      const payload = {
        ref: form.ref || '',
        name: form.nom || '',
        category: form.categorie || 'Divers',
        name_ar: form.nomAr || '',
        unit: form.unite || 'Pièce',
        sale_price: Number(form.prixVente || 0),
        sale_price_wholesale: Number(form.prixGros || 0),
        barcode: String(form.barcode || '').trim() || null,
        min_stock: Number(form.stockMin || 0),
        date_expiration: form.datePeremption || null,
        supplier_id: form.fournisseurId || null,
        branch_id: isAdmin(getStoredSession()) ? (form.branchId || form.branch_id || currentBranchId()) : currentBranchId()
      };
      if (!form.id) {
        payload.purchase_price = 0;
        payload.quantity = 0;
      }

      const q = form.id ? supabase.from('products').update(payload).eq('id', form.id) : supabase.from('products').insert(payload);
      const { error } = await q;
      if (error) throw error;
      await auditLog('Produits', form.id ? 'UPDATE' : 'CREATE', payload.ref || payload.name, form.id ? 'Modification produit' : 'Création produit');
      setForm(null);
      load();
    } catch (e) { alert(e.message); }
  }

  async function remove(id) {
    if (!confirm('Supprimer ?')) return;
    try {
      requirePerm('products.delete', 'Suppression produit');
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await auditLog('Produits', 'DELETE', id, 'Suppression produit');
      load();
    } catch (e) { alert(e.message); }
  }

  async function adjustStock() {
    try {
      requirePerm('stock.adjust', 'Ajustement stock');
      const adjLine = { produitId: stock.id, qte: Math.abs(Number(stock.qte || 0)) };
      if (Number(stock.sign || 1) > 0 && stock.cout !== undefined && stock.cout !== '') adjLine.cout = Number(stock.cout);
      await updateStock([adjLine], Number(stock.sign || 1), stock.reason || L('adjustment'), { docType: L('adjustment'), docNumber: 'ADJ-' + Date.now() });
      setStock(null);
      load();
    } catch (e) { alert(e.message); }
  }

  async function doTransfer() {
    try {
      await transferStock(transfer);
      setTransfer(null);
      load();
    } catch (e) { alert(e.message); }
  }

  if (err) return <ErrorBox msg={err} />;

  return (
    <>
      <Header title={L('products')}>
        <input className="input max-w-xs" placeholder={L('search')} value={search} onChange={e => setSearch(e.target.value)} />
        {isAdmin(getStoredSession()) ? (
          <select className="input max-w-xs" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
            <option value="all">{L('all')} - {L('branches')}</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        ) : null}
        <select className="input max-w-xs" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">{L('allCategories')}</option>
          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {canWriteProduct ? <button onClick={() => setForm({ ref: '', nom: '', categorie: lists.categories[0]?.name || 'Divers', unite: lists.units[0]?.name || 'Pièce', prixAchat: 0, prixVente: 0, quantite: 0, stockMin: 0, branchId: currentBranchId() || branches[0]?.id || '' })} className="btn bg-amber-500">{L('new')}</button> : null}
      </Header>

      <div className="flex flex-wrap gap-2 mb-4">
        {can('data.export') ? <button onClick={() => downloadCsv('produits.csv', visibleRows.map(p => ({ ref: p.ref, nom: p.nom, categorie: p.categorie, stock: p.quantite, prix_achat: p.prixAchat, prix_vente: p.prixVente, droguerie: p.branchName })))} className="btn bg-white border">{L('exportCsv')}</button> : null}
        {canWriteProduct ? <button onClick={() => setShowLists(true)} className="btn bg-white border">{L('categoriesUnits')}</button> : null}
        {canUse('stock.inventory') ? <button onClick={() => setShowInventory(true)} className="btn bg-white border">📋 {L('inventory')}</button> : null}
        {canUse('products.import') ? <button onClick={() => setShowImport(true)} className="btn bg-white border">📥 {L('importExcel')}</button> : null}
        {canUse('stock.reorder') && can('purchases.write') ? <button onClick={() => setShowReorder(true)} className="btn bg-white border">🔁 {L('reorderAuto')}</button> : null}
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div className="card p-4"><p className="text-xs text-slate-400">{L('products')}</p><p className="text-2xl font-black">{visibleRows.length}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('quantity')}</p><p className="text-2xl font-black">{fmt(totalQty)}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('stockValue')}</p><p className="text-2xl font-black">{dh(stockValue)}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('lowStock')}</p><p className="text-2xl font-black text-red-600">{lowStock}</p></div>
      </div>

      {isAdmin(getStoredSession()) ? (
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {summary.map(s => (
            <div key={s.branchId} className="card p-4">
              <div className="font-bold">{s.branchName}</div>
              <div className="text-xs text-slate-500">{s.products} produits · {fmt(s.qty)} unités</div>
              <div className="mt-2 font-mono font-black">{dh(s.value)}</div>
              <div className="text-xs text-red-500">{s.lowStock} alertes stock</div>
            </div>
          ))}
        </div>
      ) : null}

      <Table>
        <thead><tr>
          <th>{L('ref')}</th>
          <th>{L('product')}</th>
          <th>{L('category')}</th>
          <th>{L('location')}</th>
          <th>{L('stock')}</th>
          <th>{L('purchasePrice')}</th>
          <th>{L('salePrice')}</th>
          <th>{L('margin')}</th>
          <th>{L('actions')}</th>
        </tr></thead>
        <tbody>
          {visibleRows.map(p => (
            <tr key={p.id}>
              <td className="font-mono text-xs">{p.ref}</td>
              <td>
                <div className="font-semibold">{p.nom}</div>
                {p.nomAr ? <div className="text-xs text-slate-400">{p.nomAr}</div> : null}
              </td>
              <td><Badge tone="slate">{p.categorie || '-'}</Badge></td>
              <td><Badge tone="blue">{p.branchName || '-'}</Badge></td>
              <td>
                <div className={isLowStockAlert(p) ? 'text-red-600 font-bold' : 'font-bold'}>{fmt(p.quantite)} {p.unite}</div>
                <div className="text-xs text-slate-400">{L('minStock')} : {fmt(p.stockMin)}</div>
                {p.datePeremption ? <div className={'text-xs ' + (isExpiryAlert(p) ? 'text-red-600 font-bold' : 'text-slate-400')}>{L('expiry')} : {p.datePeremption}</div> : null}
              </td>
              <td className="font-mono">{dh(p.prixAchat)}<div className="text-xs text-slate-400">PMP</div></td>
              <td className="font-mono font-bold">{dh(p.prixVente)}</td>
              <td>
                <Badge tone={productProfitStatus(p) === 'critical' ? 'red' : productProfitStatus(p) === 'warning' ? 'amber' : 'green'}>{dh(p.prixVente - p.prixAchat)}</Badge>
              </td>
              <td className="flex gap-1 flex-wrap">
                {canWriteProduct ? <button onClick={() => setForm(p)} className="btn bg-white border">{L('edit')}</button> : null}
                {canAdjustStock ? <button onClick={() => setStock({ ...p, qte: 1, sign: 1, reason: L('stockAdjustIn') })} className="btn bg-white border">{L('stock')}</button> : null}
                {can('stock.transfer') && moduleOn('branches') ? <button onClick={() => setTransfer({ productId: p.id, productName: p.nom, fromBranchId: p.branchId, toBranchId: branches.find(b => Number(b.id) !== Number(p.branchId))?.id || '', quantity: 1, reason: L('stockTransfer') })} className="btn bg-white border">{L('stockTransfer')}</button> : null}
                {canDeleteProduct ? <button onClick={() => remove(p.id)} className="btn bg-red-600 text-white">{L('del')}</button> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {form ? <ProductModal L={L} form={form} setForm={setForm} save={save} close={() => setForm(null)} branches={branches} lists={lists} suppliers={suppliers} /> : null}
      {stock ? <StockModal L={L} stock={stock} setStock={setStock} save={adjustStock} close={() => setStock(null)} /> : null}
      {showLists ? <ProductListsModal L={L} lists={lists} reload={load} close={() => setShowLists(false)} /> : null}
      {showReorder ? <ReorderModal L={L} products={rows} branches={branches.length ? branches : [{ id: currentBranchId(), name: '-' }]} suppliers={suppliers} close={() => setShowReorder(false)} done={load} /> : null}
      {showImport ? <ImportModal L={L} kind="products" branches={branches} close={() => setShowImport(false)} done={load} /> : null}
      {showInventory ? <InventoryModal L={L} products={rows} branches={branches.length ? branches : [{ id: currentBranchId(), name: '-' }]} categories={categoryOptions} close={() => setShowInventory(false)} done={load} /> : null}
      {transfer ? <StockTransferModal L={L} transfer={transfer} setTransfer={setTransfer} branches={branches} save={doTransfer} close={() => setTransfer(null)} /> : null}
    </>
  );
}

function ProductModal({ L, form, setForm, save, close, branches = [], lists = { categories: [], units: [] }, suppliers = [] }) {
  const textFields = [['ref', L('ref')], ['nom', L('name')], ['nomAr', L('arabicName')]];
  const withCurrent = (items, current) => {
    const names = items.map(x => x.name);
    return current && !names.includes(current) ? [current, ...names] : names;
  };
  const catNames = withCurrent(lists.categories || [], form.categorie);
  const unitNames = withCurrent(lists.units || [], form.unite);
  const lockedStyle = { background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' };
  return (
    <Modal title={L('products')} onClose={close}>
      <div className="grid grid-cols-2 gap-3">
        {textFields.map(([k, label]) => (
          <label key={k} className="text-xs text-slate-500">
            {label}
            <input className="input mt-1" value={form[k] ?? ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />
          </label>
        ))}
        <label className="text-xs text-slate-500">
          {L('category')}
          <select className="input mt-1" value={form.categorie || ''} onChange={e => setForm({ ...form, categorie: e.target.value })}>
            {catNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          {L('unit')}
          <select className="input mt-1" value={form.unite || ''} onChange={e => setForm({ ...form, unite: e.target.value })}>
            {unitNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          {L('purchasePrice')} (PMP)
          <input className="input mt-1" style={lockedStyle} value={fmt(form.prixAchat || 0)} disabled readOnly />
          <span className="text-xs text-slate-400">{L('pmpHint')}</span>
        </label>
        <label className="text-xs text-slate-500">
          {L('salePrice')} ({L('retail')})
          <input className="input mt-1" type="number" min="0" step="0.01" value={form.prixVente ?? ''} onChange={e => setForm({ ...form, prixVente: Number(e.target.value) })} />
        </label>
        <label className="text-xs text-slate-500">
          {L('salePrice')} ({L('wholesale')})
          <input className="input mt-1" type="number" min="0" step="0.01" value={form.prixGros ?? ''} onChange={e => setForm({ ...form, prixGros: Number(e.target.value) })} />
          <span className="text-xs text-slate-400">{L('wholesaleHint')}</span>
        </label>
        <label className="text-xs text-slate-500">
          {L('barcode')}
          <input className="input mt-1" value={form.barcode || ''} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="EAN-13…" />
        </label>
        <label className="text-xs text-slate-500">
          {L('quantity')}
          <input className="input mt-1" style={lockedStyle} value={fmt(form.quantite || 0)} disabled readOnly />
          <span className="text-xs text-slate-400">{L('qtyHint')}</span>
        </label>
        <label className="text-xs text-slate-500">
          {L('threshold')}
          <input className="input mt-1" type="number" min="0" value={form.stockMin ?? ''} onChange={e => setForm({ ...form, stockMin: Number(e.target.value) })} />
        </label>
        <label className="text-xs text-slate-500">
          {L('expiry')}
          <input type="date" className="input mt-1" value={form.datePeremption || ''} onChange={e => setForm({ ...form, datePeremption: e.target.value })} />
        </label>
        <label className="text-xs text-slate-500">
          {L('mainSupplier')}
          <select className="input mt-1" value={form.fournisseurId || ''} onChange={e => setForm({ ...form, fournisseurId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">--</option>
            {suppliers.filter(x => !x.branch_id || !(form.branchId || form.branch_id) || String(x.branch_id) === String(form.branchId || form.branch_id)).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
        {isAdmin(getStoredSession()) ? (
          <label className="text-xs text-slate-500">
            {L('branch')}
            <select className="input mt-1" value={form.branchId || form.branch_id || ''} onChange={e => setForm({ ...form, branchId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">--</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
        ) : null}
      </div>
      {form.id ? <AttachmentsPanel L={L} entityType="product" entityId={form.id} branchId={form.branchId || form.branch_id} /> : null}
      <button onClick={save} className="btn bg-amber-500 mt-4">{L('save')}</button>
    </Modal>
  );
}

function StockModal({ L, stock, setStock, save, close }) {
  return (
    <Modal title={L('adjustment')} onClose={close}>
      <p className="font-semibold mb-1">{stock.nom}</p>
      <p className="text-xs text-slate-500 mb-3">{L('location')} : {stock.branchName || '-'}</p>

      <label className="text-xs text-slate-500">{L('operationType')}
        <select className="input mt-1 mb-2" value={stock.sign || 1} onChange={e => setStock({ ...stock, sign: Number(e.target.value), reason: Number(e.target.value) === 1 ? L('stockAdjustIn') : L('stockAdjustOut') })}>
          <option value={1}>{L('stockAdjustIn')}</option>
          <option value={-1}>{L('stockAdjustOut')}</option>
        </select>
      </label>

      <label className="text-xs text-slate-500">{L('quantity')}
        <input className="input mt-1 mb-2" type="number" min="0" value={stock.qte} onChange={e => setStock({ ...stock, qte: e.target.value })} />
      </label>

      {Number(stock.sign || 1) > 0 ? (
        <label className="text-xs text-slate-500">{L('unitCost')}
          <input className="input mt-1 mb-2" type="number" min="0" step="0.01" placeholder={fmt(stock.prixAchat || 0)} value={stock.cout ?? ''} onChange={e => setStock({ ...stock, cout: e.target.value })} />
          <span className="text-xs text-slate-400">{L('unitCostHint')}</span>
        </label>
      ) : null}

      <label className="text-xs text-slate-500">{L('reason')}
        <input className="input mt-1" value={stock.reason} onChange={e => setStock({ ...stock, reason: e.target.value })} />
      </label>

      <button onClick={save} className="btn bg-amber-500 mt-4">{L('save')}</button>
    </Modal>
  );
}

function ProductListsModal({ L, lists, reload, close }) {
  const [cat, setCat] = useState({ name: '', name_ar: '' });
  const [unit, setUnit] = useState('');

  async function add(kind) {
    try {
      if (kind === 'category') { await addProductListItem('category', cat.name, cat.name_ar); setCat({ name: '', name_ar: '' }); }
      else { await addProductListItem('unit', unit); setUnit(''); }
      await reload();
    } catch (e) { alert(e.message); }
  }

  async function remove(kind, item) {
    if (!confirm('Supprimer « ' + item.name + ' » ?')) return;
    try { await deleteProductListItem(kind, item); await reload(); }
    catch (e) { alert(e.message); }
  }

  return (
    <Modal title={L('categoriesUnits')} onClose={close} wide>
      {!lists.dbReady ? <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 text-sm mb-4">{L('listsNotReady')}</div> : null}
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <h3 className="font-bold mb-2">{L('categories')}</h3>
          <div className="flex gap-2 mb-3">
            <input className="input" placeholder={L('name')} value={cat.name} onChange={e => setCat({ ...cat, name: e.target.value })} />
            <input className="input" placeholder={L('arabicName')} value={cat.name_ar} onChange={e => setCat({ ...cat, name_ar: e.target.value })} />
            <button onClick={() => add('category')} className="btn bg-amber-500">+</button>
          </div>
          <div className="space-y-1">
            {lists.categories.map(c => (
              <div key={c.id || c.name} className="flex justify-between items-center bg-slate-50 rounded px-3 py-2 text-sm">
                <span>{c.name}{c.name_ar ? <span className="text-slate-400"> · {c.name_ar}</span> : null}</span>
                {c.id ? <button onClick={() => remove('category', c)} className="text-red-600">✕</button> : null}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-2">{L('units')}</h3>
          <div className="flex gap-2 mb-3">
            <input className="input" placeholder={L('unit')} value={unit} onChange={e => setUnit(e.target.value)} />
            <button onClick={() => add('unit')} className="btn bg-amber-500">+</button>
          </div>
          <div className="space-y-1">
            {lists.units.map(u => (
              <div key={u.id || u.name} className="flex justify-between items-center bg-slate-50 rounded px-3 py-2 text-sm">
                <span>{u.name}</span>
                {u.id ? <button onClick={() => remove('unit', u)} className="text-red-600">✕</button> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function StockTransferModal({ L, transfer, setTransfer, branches, save, close }) {
  return (
    <Modal title={L('stockTransfer')} onClose={close}>
      <p className="font-semibold mb-3">{transfer.productName}</p>
      <label className="text-xs text-slate-500">{L('toBranch')}
        <select className="input mt-1 mb-2" value={transfer.toBranchId || ''} onChange={e => setTransfer({ ...transfer, toBranchId: e.target.value ? Number(e.target.value) : '' })}>
          <option value="">--</option>
          {branches.filter(b => Number(b.id) !== Number(transfer.fromBranchId)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>
      <label className="text-xs text-slate-500">{L('quantity')}
        <input className="input mt-1 mb-2" type="number" min="0" value={transfer.quantity} onChange={e => setTransfer({ ...transfer, quantity: e.target.value })} />
      </label>
      <label className="text-xs text-slate-500">{L('reason')}
        <input className="input mt-1" value={transfer.reason} onChange={e => setTransfer({ ...transfer, reason: e.target.value })} />
      </label>
      <button onClick={save} className="btn bg-amber-500 mt-4">{L('save')}</button>
    </Modal>
  );
}

/* ===================== Inventaire physique ===================== */
function isMissingTableError(error, status) {
  if (Number(status) === 404) return true;
  const m = String(error?.message || '') + ' ' + String(error?.code || '');
  return /42P01|PGRST205|does not exist|Could not find the table/i.test(m);
}

async function loadInventories() {
  const session = getStoredSession();
  let q = supabase.from('inventories').select('*').order('id', { ascending: false }).limit(50);
  if (!isAdmin(session)) q = q.eq('branch_id', branchId(session) || -1);
  const { data, error, status } = await q;
  if (error) {
    if (isMissingTableError(error, status)) return { rows: [], dbReady: false };
    throw new Error(error.message);
  }
  return { rows: data || [], dbReady: true };
}

// Valide un inventaire : l'écart est recalculé sur le stock au moment de la validation
// (les ventes faites pendant le comptage ne faussent pas le résultat), puis appliqué en mouvements de stock.
async function validateInventory({ branchId: invBranch, category, counts, note }) {
  requireUse('stock.inventory', 'Inventaire');
  const ids = Object.keys(counts || {}).filter(id => counts[id] !== '' && counts[id] !== null && counts[id] !== undefined).map(Number);
  if (!ids.length) throw new Error('Aucune quantité comptée');
  const { data: products, error } = await supabase.from('products').select('id, ref, name, unit, quantity, purchase_price, branch_id').in('id', ids);
  if (error) throw new Error(error.message);
  const number = await nextNumber('INV');
  const lines = (products || []).map(p => {
    const theo = Number(p.quantity || 0);
    const counted = Math.max(0, Number(counts[p.id] || 0));
    const gap = Number((counted - theo).toFixed(4));
    return { produitId: p.id, ref: p.ref, nom: p.name, unite: p.unit, theo, compte: counted, ecart: gap, pmp: Number(p.purchase_price || 0), valeurEcart: gap * Number(p.purchase_price || 0) };
  });
  const plus = lines.filter(l => l.ecart > 0).map(l => ({ produitId: l.produitId, qte: l.ecart }));
  const minus = lines.filter(l => l.ecart < 0).map(l => ({ produitId: l.produitId, qte: -l.ecart }));
  const reason = 'Inventaire ' + number;
  if (minus.length) await updateStock(minus, -1, reason, { docType: 'Inventaire', docNumber: number });
  if (plus.length) await updateStock(plus, 1, reason, { docType: 'Inventaire', docNumber: number });
  const gapValue = lines.reduce((s, l) => s + l.valeurEcart, 0);
  const s = getStoredSession();
  const { error: insErr, status: insStatus } = await supabase.from('inventories').insert({
    number,
    inv_date: new Date().toISOString().slice(0, 10),
    branch_id: invBranch || branchId(s) || null,
    category: category && category !== 'all' ? category : null,
    lines_json: lines,
    gap_value: Number(gapValue.toFixed(2)),
    note: note || null,
    created_by: s?.user?.id || null,
    created_by_label: currentUserLabel()
  });
  if (insErr && !isMissingTableError(insErr, insStatus)) throw new Error(insErr.message);
  await auditLog('Stock', 'INVENTORY', number, `${lines.length} produits comptés · ${lines.filter(l => l.ecart).length} écarts · ${fmt(gapValue)} DH`);
  return { number, lines, gapValue };
}

function inventoryDraftKey(bId) { return 'droguerie_inventory_draft_' + (bId || 0); }
function readInventoryDraft(bId) { try { return JSON.parse(localStorage.getItem(inventoryDraftKey(bId)) || 'null') || {}; } catch { return {}; } }
function writeInventoryDraft(bId, counts) { try { localStorage.setItem(inventoryDraftKey(bId), JSON.stringify(counts)); } catch { /* stockage indisponible */ } }
function clearInventoryDraft(bId) { try { localStorage.removeItem(inventoryDraftKey(bId)); } catch { /* ignore */ } }

function InventoryModal({ L, products, branches, categories, close, done }) {
  const session = getStoredSession();
  const admin = isAdmin(session);
  const [tab, setTab] = useState('count');
  const [invBranch, setInvBranch] = useState(admin ? (currentBranchId() || branches[0]?.id || '') : currentBranchId());
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');
  const [onlyGaps, setOnlyGaps] = useState(false);
  const [counts, setCounts] = useState(() => readInventoryDraft(admin ? (currentBranchId() || branches[0]?.id || '') : currentBranchId()));
  const [note, setNote] = useState('');
  const [scan, setScan] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState({ rows: [], dbReady: true });
  const [open, setOpen] = useState(null);

  useEffect(() => { setCounts(readInventoryDraft(invBranch)); }, [invBranch]);
  useEffect(() => { writeInventoryDraft(invBranch, counts); }, [counts, invBranch]);
  useEffect(() => { loadInventories().then(setHistory).catch(() => {}); }, []);

  const scope = products.filter(p => String(p.branchId || '') === String(invBranch || ''))
    .filter(p => cat === 'all' || String(p.categorie || '') === cat);
  const rows = scope
    .filter(p => !search || [p.ref, p.nom, p.nomAr, p.barcode].join(' ').toLowerCase().includes(search.toLowerCase()))
    .filter(p => !onlyGaps || (counts[p.id] !== undefined && counts[p.id] !== '' && Number(counts[p.id]) !== Number(p.quantite || 0)));
  const counted = scope.filter(p => counts[p.id] !== undefined && counts[p.id] !== '');
  const gapOf = p => Number(counts[p.id]) - Number(p.quantite || 0);
  const gapValue = counted.reduce((s, p) => s + gapOf(p) * Number(p.prixAchat || 0), 0);
  const gapLines = counted.filter(p => Math.abs(gapOf(p)) > 0.0001).length;

  function setCount(id, v) { setCounts(c => ({ ...c, [id]: v === '' ? '' : Number(v) })); }
  function prefill() { const c = { ...counts }; scope.forEach(p => { if (c[p.id] === undefined || c[p.id] === '') c[p.id] = Number(p.quantite || 0); }); setCounts(c); }
  function reset() { if (!confirm(L('inventoryReset') + ' ?')) return; setCounts({}); clearInventoryDraft(invBranch); }
  function onScan(e) {
    if (e.key !== 'Enter' || !scan.trim()) return;
    const code = scan.trim().toLowerCase();
    const p = scope.find(x => String(x.barcode || '').toLowerCase() === code) || scope.find(x => String(x.ref || '').toLowerCase() === code);
    if (!p) { alert(L('productNotFound') + ' : ' + scan); setScan(''); return; }
    setCounts(c => ({ ...c, [p.id]: Number(c[p.id] || 0) + 1 }));
    setSearch(p.ref || p.nom);
    setScan('');
  }
  function exportSheet() {
    downloadCsv('feuille-inventaire.csv', scope.map(p => ({ ref: p.ref, produit: p.nom, unite: p.unite, stock_theorique: p.quantite, quantite_comptee: counts[p.id] ?? '' })));
  }
  async function validate() {
    if (!counted.length) { alert(L('inventoryNothing')); return; }
    if (!confirm(`${L('inventoryValidate')} : ${counted.length} ${L('products')}, ${gapLines} ${L('inventoryGaps')}, ${dh(gapValue)} ?`)) return;
    setBusy(true);
    try {
      const countsForScope = {};
      counted.forEach(p => { countsForScope[p.id] = counts[p.id]; });
      const r = await validateInventory({ branchId: invBranch, category: cat, counts: countsForScope, note });
      const rest = { ...counts }; counted.forEach(p => { delete rest[p.id]; });
      setCounts(rest);
      alert(`${r.number} — ${L('inventoryDone')}`);
      setHistory(await loadInventories());
      setTab('history');
      done && done();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }
  function printInv(inv) {
    const lines = inv.lines_json || [];
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`<html><head><title>${escapeHtml(inv.number)}</title><style>body{font-family:Arial;font-size:12px;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}td.n{text-align:right}</style></head><body>
      <h2>${escapeHtml(L('inventory'))} ${escapeHtml(inv.number)}</h2>
      <p>${escapeHtml(inv.inv_date || '')} · ${escapeHtml(inv.created_by_label || '')} ${inv.category ? '· ' + escapeHtml(inv.category) : ''}</p>
      <table><thead><tr><th>Réf</th><th>Produit</th><th>Théorique</th><th>Compté</th><th>Écart</th><th>Valeur écart</th></tr></thead><tbody>
      ${lines.map(l => `<tr><td>${escapeHtml(l.ref)}</td><td>${escapeHtml(l.nom)}</td><td class="n">${fmt(l.theo)}</td><td class="n">${fmt(l.compte)}</td><td class="n">${fmt(l.ecart)}</td><td class="n">${fmt(l.valeurEcart)}</td></tr>`).join('')}
      </tbody></table><p><b>Valeur totale des écarts : ${fmt(inv.gap_value)} DH</b></p>${inv.note ? '<p>' + escapeHtml(inv.note) + '</p>' : ''}
      <script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  }

  return (
    <Modal title={L('inventory')} onClose={close} wide>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setTab('count')} className={'btn ' + (tab === 'count' ? 'bg-amber-500' : 'bg-white border')}>{L('inventoryCount')}</button>
        <button onClick={() => setTab('history')} className={'btn ' + (tab === 'history' ? 'bg-amber-500' : 'bg-white border')}>{L('history')} ({history.rows.length})</button>
      </div>

      {tab === 'count' ? (
        <>
          <p className="text-xs text-slate-500 mb-3">{L('inventoryHint')}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {admin ? (
              <select className="input max-w-[180px]" value={invBranch || ''} onChange={e => setInvBranch(e.target.value ? Number(e.target.value) : '')}>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            ) : null}
            <select className="input max-w-[180px]" value={cat} onChange={e => setCat(e.target.value)}>
              <option value="all">{L('allCategories')}</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="input max-w-[200px]" placeholder={L('search')} value={search} onChange={e => setSearch(e.target.value)} />
            <input className="input max-w-[200px]" placeholder={'▮▮ ' + L('scanBarcode')} value={scan} onChange={e => setScan(e.target.value)} onKeyDown={onScan} />
            <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={onlyGaps} onChange={e => setOnlyGaps(e.target.checked)} /> {L('inventoryOnlyGaps')}</label>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={prefill} className="btn bg-white border">{L('inventoryPrefill')}</button>
            <button onClick={exportSheet} className="btn bg-white border">{L('inventorySheet')}</button>
            <button onClick={reset} className="btn bg-white border text-red-600">{L('inventoryReset')}</button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
            <div className="card p-3"><div className="text-xs text-slate-400">{L('inventoryCounted')}</div><div className="font-black">{counted.length} / {scope.length}</div></div>
            <div className="card p-3"><div className="text-xs text-slate-400">{L('inventoryGaps')}</div><div className="font-black">{gapLines}</div></div>
            <div className="card p-3"><div className="text-xs text-slate-400">{L('inventoryGapValue')}</div><div className={'font-black ' + (gapValue < 0 ? 'text-red-600' : 'text-green-700')}>{dh(gapValue)}</div></div>
          </div>
          <div className="max-h-[45vh] overflow-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0"><tr>
                <th className="p-2 text-start">{L('ref')}</th><th className="p-2 text-start">{L('product')}</th>
                <th className="p-2 text-end">{L('inventoryTheo')}</th><th className="p-2 text-end">{L('inventoryCounted')}</th>
                <th className="p-2 text-end">{L('inventoryGap')}</th><th className="p-2 text-end">{L('inventoryGapValue')}</th>
              </tr></thead>
              <tbody>
                {rows.map(p => {
                  const has = counts[p.id] !== undefined && counts[p.id] !== '';
                  const g = has ? gapOf(p) : 0;
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="p-2 font-mono text-xs">{p.ref}</td>
                      <td className="p-2">{p.nom}<div className="text-xs text-slate-400">{p.unite}</div></td>
                      <td className="p-2 text-end">{fmt(p.quantite)}</td>
                      <td className="p-2 text-end"><input className="input w-24 text-end" type="number" min="0" step="any" value={counts[p.id] ?? ''} onChange={e => setCount(p.id, e.target.value)} /></td>
                      <td className={'p-2 text-end font-bold ' + (!has || !g ? 'text-slate-400' : g < 0 ? 'text-red-600' : 'text-green-700')}>{has ? (g > 0 ? '+' : '') + fmt(g) : '-'}</td>
                      <td className="p-2 text-end font-mono">{has && g ? dh(g * Number(p.prixAchat || 0)) : '-'}</td>
                    </tr>
                  );
                })}
                {!rows.length ? <tr><td colSpan={6} className="p-4 text-center text-slate-400">—</td></tr> : null}
              </tbody>
            </table>
          </div>
          <input className="input mt-3" placeholder={L('note')} value={note} onChange={e => setNote(e.target.value)} />
          <button disabled={busy} onClick={validate} className="btn bg-amber-500 mt-3">{busy ? '…' : L('inventoryValidate')}</button>
        </>
      ) : (
        <>
          {!history.dbReady ? <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 text-sm mb-3">{L('inventoryNotReady')}</div> : null}
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {history.rows.map(inv => (
              <div key={inv.id} className="border rounded-lg">
                <div className="flex flex-wrap justify-between items-center gap-2 p-3">
                  <div>
                    <div className="font-bold">{inv.number}</div>
                    <div className="text-xs text-slate-500">{inv.inv_date} · {inv.created_by_label || '-'} {inv.category ? '· ' + inv.category : ''} · {(inv.lines_json || []).length} {L('products')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={'font-mono font-bold ' + (Number(inv.gap_value) < 0 ? 'text-red-600' : 'text-green-700')}>{dh(inv.gap_value)}</span>
                    <button onClick={() => setOpen(open === inv.id ? null : inv.id)} className="btn bg-white border">{L('details')}</button>
                    <button onClick={() => printInv(inv)} className="btn bg-white border">{L('print')}</button>
                  </div>
                </div>
                {open === inv.id ? (
                  <table className="w-full text-xs border-t">
                    <tbody>
                      {(inv.lines_json || []).filter(l => l.ecart).map((l, i) => (
                        <tr key={i} className="border-t"><td className="p-2">{l.ref}</td><td className="p-2">{l.nom}</td><td className="p-2 text-end">{fmt(l.theo)} → {fmt(l.compte)}</td><td className={'p-2 text-end font-bold ' + (l.ecart < 0 ? 'text-red-600' : 'text-green-700')}>{l.ecart > 0 ? '+' : ''}{fmt(l.ecart)}</td><td className="p-2 text-end">{dh(l.valeurEcart)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
              </div>
            ))}
            {!history.rows.length ? <p className="text-slate-400 text-sm">—</p> : null}
          </div>
        </>
      )}
    </Modal>
  );
}

/* ===================== Import Excel (produits, clients, fournisseurs) ===================== */
const IMPORT_COLUMNS = {
  products: [
    ['ref', 'Référence', true, 'PEI-001'], ['nom', 'Désignation', true, 'Peinture blanche 5L'], ['nom_ar', 'Nom arabe', false, 'صباغة بيضاء 5 لتر'],
    ['categorie', 'Catégorie', false, 'Peinture'], ['unite', 'Unité', false, 'Pièce'], ['prix_vente', 'Prix vente TTC (détail)', false, 180],
    ['prix_gros', 'Prix vente TTC (gros)', false, 165], ['code_barre', 'Code-barres', false, '6111234567890'], ['stock_min', 'Stock minimum', false, 5],
    ['stock_initial', 'Stock initial (nouveaux produits)', false, 20], ['cout_unitaire', 'Coût unitaire HT (PMP)', false, 120], ['peremption', 'Date péremption (AAAA-MM-JJ)', false, '']
  ],
  clients: [
    ['nom', 'Nom', true, 'Entreprise Atlas BTP'], ['type', 'Type (entreprise / particulier)', false, 'entreprise'], ['telephone', 'Téléphone', false, '0661000000'],
    ['ville', 'Ville', false, 'Casablanca'], ['adresse', 'Adresse', false, 'Bd Zerktouni'], ['ice', 'ICE', false, '001234567000089'],
    ['tarif', 'Tarif (detail / gros)', false, 'gros'], ['plafond', 'Plafond de crédit (DH, 0 = aucun)', false, 20000]
  ],
  suppliers: [
    ['nom', 'Nom', true, 'Sodipeint'], ['contact', 'Contact', false, 'M. Alaoui'], ['telephone', 'Téléphone', false, '0522000000'],
    ['ville', 'Ville', false, 'Casablanca'], ['adresse', 'Adresse', false, 'Zone industrielle'], ['ice', 'ICE', false, '']
  ]
};
const IMPORT_ALIASES = {
  reference: 'ref', code: 'ref', code_article: 'ref', designation: 'nom', name: 'nom', produit: 'nom', libelle: 'nom', nom_produit: 'nom',
  nom_arabe: 'nom_ar', arabe: 'nom_ar', name_ar: 'nom_ar', category: 'categorie', famille: 'categorie', unit: 'unite',
  prix: 'prix_vente', prix_vente_ttc: 'prix_vente', prix_vente_ttc_detail: 'prix_vente', prix_detail: 'prix_vente', sale_price: 'prix_vente',
  prix_vente_ttc_gros: 'prix_gros', prix_de_gros: 'prix_gros', wholesale: 'prix_gros',
  code_barres: 'code_barre', codebarre: 'code_barre', barcode: 'code_barre', ean: 'code_barre', ean13: 'code_barre',
  stock_minimum: 'stock_min', seuil: 'stock_min', min_stock: 'stock_min', stock: 'stock_initial', quantite: 'stock_initial', qte: 'stock_initial',
  stock_initial_nouveaux_produits: 'stock_initial', cout: 'cout_unitaire', prix_achat: 'cout_unitaire', cout_unitaire_ht: 'cout_unitaire',
  cout_unitaire_ht_pmp: 'cout_unitaire', pmp: 'cout_unitaire', date_peremption: 'peremption', date_peremption_aaaa_mm_jj: 'peremption', expiration: 'peremption',
  tel: 'telephone', phone: 'telephone', gsm: 'telephone', city: 'ville', address: 'adresse', type_entreprise_particulier: 'type',
  tarif_detail_gros: 'tarif', price_tier: 'tarif', plafond_de_credit_dh_0_aucun: 'plafond', plafond_credit: 'plafond', credit_limit: 'plafond'
};

function normalizeImportHeader(h) {
  const k = String(h ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return IMPORT_ALIASES[k] || k;
}

function parseImportNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/\s|DH|MAD/gi, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

function parseImportDate(v) {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return 'invalid';
}

function importCellText(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v;
  if (typeof v === 'object') {
    if (v.result !== undefined) return importCellText(v.result);
    if (Array.isArray(v.richText)) return v.richText.map(x => x.text).join('');
    if (v.text !== undefined) return importCellText(v.text);
    if (v.hyperlink) return String(v.hyperlink);
    return '';
  }
  return typeof v === 'string' ? v.trim() : v;
}

function parseCsvText(text) {
  const clean = String(text || '').replace(/^﻿/, '');
  const first = clean.split(/\r?\n/)[0] || '';
  const sep = (first.match(/;/g) || []).length >= (first.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(cell.trim()); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && clean[i + 1] === '\n') i++;
      row.push(cell.trim()); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows.filter(r => r.some(x => x !== ''));
}

// Lit un fichier .xlsx ou .csv → tableau d'objets indexés par les colonnes normalisées
async function readImportFile(file) {
  const name = String(file?.name || '').toLowerCase();
  let matrix;
  if (name.endsWith('.csv') || name.endsWith('.txt')) {
    matrix = parseCsvText(await file.text());
  } else if (name.endsWith('.xlsx')) {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0];
    if (!ws) throw new Error('Fichier vide');
    matrix = [];
    ws.eachRow({ includeEmpty: false }, row => {
      const vals = [];
      for (let c = 1; c <= ws.columnCount; c++) vals.push(importCellText(row.getCell(c).value));
      if (vals.some(v => v !== '' && v !== null)) matrix.push(vals);
    });
  } else {
    throw new Error('Format non pris en charge : utilisez un fichier Excel .xlsx ou .csv (Excel → Enregistrer sous → Classeur Excel .xlsx)');
  }
  if (matrix.length < 2) throw new Error('Le fichier ne contient aucune ligne de données');
  const headers = matrix[0].map(normalizeImportHeader);
  return matrix.slice(1).map((r, i) => {
    const o = { __line: i + 2 };
    headers.forEach((h, j) => { if (h && o[h] === undefined) o[h] = r[j] ?? ''; });
    return o;
  });
}

// Analyse : pour chaque ligne → création, mise à jour ou erreur (aucune écriture)
function planImport(kind, rows, existing) {
  const cols = IMPORT_COLUMNS[kind];
  const required = cols.filter(c => c[2]).map(c => c[0]);
  const keyOf = r => kind === 'products' ? String(r.ref || '').trim().toLowerCase() : String(r.nom || '').trim().toLowerCase();
  const existingByKey = {};
  (existing || []).forEach(e => { existingByKey[kind === 'products' ? String(e.ref || '').trim().toLowerCase() : String(e.name || '').trim().toLowerCase()] = e; });
  const seen = new Set();
  return rows.map(r => {
    const errors = [];
    required.forEach(k => { if (String(r[k] ?? '').trim() === '') errors.push(k + ' obligatoire'); });
    const values = {};
    cols.forEach(([k]) => {
      const raw = r[k];
      if (raw === undefined || raw === null || String(raw).trim?.() === '') return;
      if (['prix_vente', 'prix_gros', 'stock_min', 'stock_initial', 'cout_unitaire', 'plafond'].includes(k)) {
        const n = parseImportNumber(raw);
        if (Number.isNaN(n) || n < 0) errors.push(k + ' invalide (' + raw + ')'); else values[k] = n;
      } else if (k === 'peremption') {
        const d = parseImportDate(raw);
        if (d === 'invalid') errors.push('date invalide (' + raw + ')'); else values[k] = d;
      } else values[k] = String(raw instanceof Date ? raw.toISOString().slice(0, 10) : raw).trim();
    });
    if (kind === 'clients' && values.tarif && !['detail', 'gros', 'détail'].includes(values.tarif.toLowerCase())) errors.push('tarif : detail ou gros');
    const key = keyOf(r);
    if (key && seen.has(key)) errors.push('doublon dans le fichier');
    if (key) seen.add(key);
    const match = key ? existingByKey[key] : null;
    return { line: r.__line, key, values, errors, action: errors.length ? 'error' : match ? 'update' : 'create', existingId: match?.id || null };
  });
}

async function executeImport(kind, plan, { branchId: targetBranch, onProgress } = {}) {
  requirePerm(kind === 'products' ? 'products.write' : kind + '.write', 'Import');
  if (kind === 'products') requireUse('products.import', 'Import');
  else if (!featureOn('import')) throw new Error('Import non autorisée');
  const session = getStoredSession();
  const bId = isAdmin(session) ? (targetBranch || branchId(session)) : branchId(session);
  const ok = plan.filter(p => p.action !== 'error');
  const result = { created: 0, updated: 0, stocked: 0, failed: [] };
  const number = 'IMP-' + new Date().toISOString().slice(0, 10).replaceAll('-', '') + '-' + String(Date.now()).slice(-5);
  let done = 0;
  const tick = () => { done++; onProgress && onProgress(done, ok.length); };

  if (kind === 'products') {
    // Catégories et unités nouvelles ajoutées aux listes
    try {
      const lists = await loadProductLists();
      if (lists.dbReady) {
        const cats = new Set(lists.categories.map(c => c.name.toLowerCase()));
        const units = new Set(lists.units.map(u => u.name.toLowerCase()));
        for (const p of ok) {
          if (p.values.categorie && !cats.has(p.values.categorie.toLowerCase())) { cats.add(p.values.categorie.toLowerCase()); await addProductListItem('category', p.values.categorie).catch(() => {}); }
          if (p.values.unite && !units.has(p.values.unite.toLowerCase())) { units.add(p.values.unite.toLowerCase()); await addProductListItem('unit', p.values.unite).catch(() => {}); }
        }
      }
    } catch { /* listes optionnelles */ }
    const canStock = can('stock.adjust') || can('purchases.write');
    for (const p of ok) {
      const v = p.values;
      const payload = {};
      if (v.ref !== undefined) payload.ref = v.ref;
      if (v.nom !== undefined) payload.name = v.nom;
      if (v.nom_ar !== undefined) payload.name_ar = v.nom_ar;
      if (v.categorie !== undefined) payload.category = v.categorie;
      if (v.unite !== undefined) payload.unit = v.unite;
      if (v.prix_vente !== undefined) payload.sale_price = v.prix_vente;
      if (v.prix_gros !== undefined) payload.sale_price_wholesale = v.prix_gros;
      if (v.code_barre !== undefined) payload.barcode = v.code_barre;
      if (v.stock_min !== undefined) payload.min_stock = v.stock_min;
      if (v.peremption !== undefined) payload.date_expiration = v.peremption;
      try {
        if (p.action === 'update') {
          const { error } = await supabase.from('products').update(payload).eq('id', p.existingId);
          if (error) throw new Error(error.message);
          result.updated++;
        } else {
          const { data, error } = await supabase.from('products').insert({ category: 'Divers', unit: 'Pièce', ...payload, quantity: 0, purchase_price: 0, branch_id: bId }).select('id').single();
          if (error) throw new Error(error.message);
          result.created++;
          if (Number(v.stock_initial || 0) > 0) {
            if (!canStock) throw new Error('créé, mais stock initial non autorisé pour votre profil');
            const line = { produitId: data.id, qte: Number(v.stock_initial) };
            if (Number(v.cout_unitaire || 0) > 0) line.cout = Number(v.cout_unitaire);
            await updateStock([line], 1, 'Stock initial (import)', { docType: 'Import', docNumber: number });
            result.stocked++;
          }
        }
      } catch (e) { result.failed.push({ line: p.line, error: e.message }); }
      tick();
    }
  } else {
    for (const p of ok) {
      const v = p.values;
      const body = p.action === 'update' ? { id: p.existingId } : {};
      try {
        if (p.action === 'update') {
          const payload = {};
          if (v.nom !== undefined) payload.name = v.nom;
          if (v.telephone !== undefined) payload.phone = v.telephone;
          if (v.ville !== undefined) payload.city = v.ville;
          if (v.adresse !== undefined) payload.address = v.adresse;
          if (v.ice !== undefined) payload.ice = v.ice;
          if (kind === 'clients') {
            if (v.type !== undefined) payload.type = v.type.toLowerCase();
            if (v.tarif !== undefined) payload.price_tier = v.tarif.toLowerCase() === 'gros' ? 'gros' : 'detail';
            if (v.plafond !== undefined) payload.credit_limit = v.plafond;
          } else if (v.contact !== undefined) payload.contact = v.contact;
          const { error } = await supabase.from(kind).update(payload).eq('id', body.id);
          if (error) throw new Error(error.message);
          result.updated++;
        } else {
          await saveParty(kind, {
            name: v.nom, phone: v.telephone || '', city: v.ville || '', address: v.adresse || '', ice: v.ice || '', branch_id: bId,
            type: (v.type || 'entreprise').toLowerCase(), price_tier: String(v.tarif || '').toLowerCase() === 'gros' ? 'gros' : 'detail',
            credit_limit: v.plafond || 0, contact: v.contact || ''
          });
          result.created++;
        }
      } catch (e) { result.failed.push({ line: p.line, error: e.message }); }
      tick();
    }
  }
  await auditLog(kind === 'products' ? 'Produits' : kind === 'clients' ? 'Clients' : 'Fournisseurs', 'IMPORT', number, `${result.created} créés, ${result.updated} mis à jour, ${result.failed.length} erreurs`);
  return result;
}

async function downloadImportTemplate(kind) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(kind === 'products' ? 'Produits' : kind === 'clients' ? 'Clients' : 'Fournisseurs');
  const cols = IMPORT_COLUMNS[kind];
  ws.columns = cols.map(([k, label, req]) => ({ header: label + (req ? ' *' : ''), key: k, width: Math.max(14, label.length + 4) }));
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  const help = wb.addWorksheet('Aide');
  help.columns = [{ header: 'Colonne', width: 36 }, { header: 'Obligatoire', width: 12 }, { header: 'Exemple', width: 28 }];
  cols.forEach(([, label, req, ex]) => help.addRow([label, req ? 'Oui' : '', ex]));
  help.addRow([]);
  help.addRow(['La 1re feuille ne contient que les en-têtes : ajoutez une ligne par ' + (kind === 'products' ? 'produit' : 'tiers') + ' (colonnes marquées * obligatoires).']);
  help.addRow([kind === 'products' ? 'Un produit existant (même référence dans la droguerie) est mis à jour ; le stock initial ne s\'applique qu\'aux nouveaux produits.' : 'Un tiers existant (même nom dans la droguerie) est mis à jour.']);
  help.getRow(1).font = { bold: true };
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'modele-import-' + kind + '.xlsx'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function ImportModal({ L, kind, branches = [], close, done }) {
  const session = getStoredSession();
  const admin = isAdmin(session);
  const [target, setTarget] = useState(currentBranchId() || branches[0]?.id || '');
  const [fileName, setFileName] = useState('');
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [rawRows, setRawRows] = useState(null);

  async function analyse(rows, bId) {
    const table = kind === 'products' ? 'products' : kind;
    let q = supabase.from(table).select(kind === 'products' ? 'id, ref' : 'id, name');
    if (bId) q = q.eq('branch_id', bId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    setPlan(planImport(kind, rows, data || []));
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setErr(''); setResult(null); setPlan(null); setFileName(f.name); setBusy(true);
    try {
      const rows = await readImportFile(f);
      if (rows.length > 5000) throw new Error('Maximum 5000 lignes par import');
      setRawRows(rows);
      await analyse(rows, admin ? target : currentBranchId());
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  async function changeTarget(v) {
    setTarget(v);
    if (rawRows) { setBusy(true); try { await analyse(rawRows, v); } catch (x) { setErr(x.message); } setBusy(false); }
  }

  async function run() {
    setBusy(true); setErr('');
    try {
      const r = await executeImport(kind, plan, { branchId: admin ? target : currentBranchId(), onProgress: (d, t) => setProgress({ d, t }) });
      setResult(r); setPlan(null); setRawRows(null);
      done && done();
    } catch (x) { setErr(x.message); }
    setBusy(false); setProgress(null);
  }

  const counts = plan ? { create: plan.filter(p => p.action === 'create').length, update: plan.filter(p => p.action === 'update').length, error: plan.filter(p => p.action === 'error').length } : null;
  const title = L('importExcel') + ' — ' + L(kind);

  return (
    <Modal title={title} onClose={close} wide>
      <p className="text-sm text-slate-500 mb-3">{L(kind === 'products' ? 'importHintProducts' : 'importHintParties')}</p>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <button onClick={() => downloadImportTemplate(kind).catch(x => alert(x.message))} className="btn bg-white border">⬇ {L('importTemplate')}</button>
        <label className="btn bg-amber-500 cursor-pointer">📂 {L('importChoose')}<input type="file" accept=".xlsx,.csv" className="hidden" onChange={onFile} /></label>
        {admin && branches.length ? (
          <select className="input max-w-[200px]" value={target || ''} onChange={e => changeTarget(e.target.value ? Number(e.target.value) : '')}>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        ) : null}
        {fileName ? <span className="text-xs text-slate-500">{fileName}</span> : null}
      </div>
      {err ? <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm mb-3">{err}</div> : null}
      {busy && !progress ? <p className="text-sm text-slate-500">…</p> : null}
      {progress ? <div className="mb-3"><div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-amber-500 rounded" style={{ width: (100 * progress.d / Math.max(1, progress.t)) + '%' }} /></div><p className="text-xs text-slate-500 mt-1">{progress.d} / {progress.t}</p></div> : null}

      {plan ? (
        <>
          <div className="flex flex-wrap gap-2 mb-3 text-sm">
            <Badge tone="green">{counts.create} {L('importNew')}</Badge>
            <Badge tone="blue">{counts.update} {L('importUpdate')}</Badge>
            <Badge tone={counts.error ? 'red' : 'slate'}>{counts.error} {L('importErrors')}</Badge>
          </div>
          <div className="max-h-[45vh] overflow-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0"><tr>
                <th className="p-2 text-start">#</th><th className="p-2 text-start">{L('statusLbl')}</th>
                {IMPORT_COLUMNS[kind].slice(0, kind === 'products' ? 6 : 5).map(c => <th key={c[0]} className="p-2 text-start">{c[1]}</th>)}
                {kind === 'products' ? <th className="p-2 text-start">{L('importStock')}</th> : null}
              </tr></thead>
              <tbody>
                {plan.slice(0, 500).map(p => (
                  <tr key={p.line} className={'border-t ' + (p.action === 'error' ? 'bg-red-50' : '')}>
                    <td className="p-2">{p.line}</td>
                    <td className="p-2">{p.action === 'error' ? <span className="text-red-600">{p.errors.join(', ')}</span> : <Badge tone={p.action === 'create' ? 'green' : 'blue'}>{L(p.action === 'create' ? 'importNew' : 'importUpdate')}</Badge>}</td>
                    {IMPORT_COLUMNS[kind].slice(0, kind === 'products' ? 6 : 5).map(c => <td key={c[0]} className="p-2">{p.values[c[0]] ?? ''}</td>)}
                    {kind === 'products' ? <td className="p-2">{p.action === 'create' && p.values.stock_initial ? fmt(p.values.stock_initial) + (p.values.cout_unitaire ? ' @ ' + fmt(p.values.cout_unitaire) : '') : p.action === 'update' && p.values.stock_initial ? <span className="text-slate-400">{L('importStockIgnored')}</span> : ''}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {plan.length > 500 ? <p className="text-xs text-slate-400 mt-1">… {plan.length - 500} lignes de plus</p> : null}
          <button disabled={busy || !(counts.create + counts.update)} onClick={run} className="btn bg-amber-500 mt-4">{L('importRun')} ({counts.create + counts.update})</button>
        </>
      ) : null}

      {result ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="font-bold text-green-800">{L('importDone')}</p>
          <p>{result.created} {L('importNew')} · {result.updated} {L('importUpdate')}{kind === 'products' ? ' · ' + result.stocked + ' ' + L('importStocked') : ''}</p>
          {result.failed.length ? <ul className="text-red-700 mt-2">{result.failed.map(f => <li key={f.line}>#{f.line} : {f.error}</li>)}</ul> : null}
        </div>
      ) : null}
    </Modal>
  );
}

/* ===================== Clôture de caisse journalière ===================== */
const CASH_DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.5];
function isCashMode(mode) { return !mode || /esp|cash|نقد/i.test(String(mode)); }

// Calcul pur (testable) : totaux du jour par mode, espèces attendues en caisse
function computeCashClosure(payments, expenses, { date, branchId: bId, opening = 0 }) {
  const sameBranch = x => !bId || String(x.branchId ?? x.branch_id ?? '') === String(bId);
  const dayPays = (payments || []).filter(p => p.date === date && !p.canceled && p.mode !== 'Avoir' && sameBranch(p));
  const dayExp = (expenses || []).filter(x => String(x.date || '').slice(0, 10) === date && sameBranch(x));
  const byMode = {};
  dayPays.forEach(p => {
    const m = p.mode || 'Espèces';
    byMode[m] = byMode[m] || { in: 0, out: 0, count: 0 };
    byMode[m][p.type === 'encaissement' ? 'in' : 'out'] += Number(p.montant || 0);
    byMode[m].count++;
  });
  const cashIn = dayPays.filter(p => p.type === 'encaissement' && isCashMode(p.mode)).reduce((s, p) => s + Number(p.montant || 0), 0);
  const cashOutPurchases = dayPays.filter(p => p.type === 'decaissement' && isCashMode(p.mode)).reduce((s, p) => s + Number(p.montant || 0), 0);
  const cashExpenses = dayExp.filter(x => isCashMode(x.mode)).reduce((s, x) => s + Number(x.amount || 0), 0);
  const totalIn = dayPays.filter(p => p.type === 'encaissement').reduce((s, p) => s + Number(p.montant || 0), 0);
  const totalOut = dayPays.filter(p => p.type === 'decaissement').reduce((s, p) => s + Number(p.montant || 0), 0);
  const expected = Number(opening || 0) + cashIn - cashOutPurchases - cashExpenses;
  return { byMode, cashIn, cashOutPurchases, cashExpenses, totalIn, totalOut, expensesTotal: dayExp.reduce((s, x) => s + Number(x.amount || 0), 0), expected: Number(expected.toFixed(2)), paymentsCount: dayPays.length };
}

async function loadCashClosures(bId) {
  let q = supabase.from('cash_closures').select('*').order('closure_date', { ascending: false }).limit(60);
  if (bId) q = q.eq('branch_id', bId);
  const { data, error, status } = await q;
  if (error) {
    if (isMissingTableError(error, status)) return { rows: [], dbReady: false };
    throw new Error(error.message);
  }
  return { rows: data || [], dbReady: true };
}

async function saveCashClosure(c) {
  if (!canUse('cash.close')) throw new Error('Clôture de caisse non autorisée');
  const s = getStoredSession();
  const payload = {
    closure_date: c.date, branch_id: c.branchId || null, totals_json: c.totals,
    opening_cash: Number(c.opening || 0), expected_cash: Number(c.expected || 0), counted_cash: Number(c.counted || 0),
    gap: Number((Number(c.counted || 0) - Number(c.expected || 0)).toFixed(2)), note: c.note || null,
    created_by: s?.user?.id || null, created_by_label: currentUserLabel()
  };
  let q = supabase.from('cash_closures').select('id').eq('closure_date', c.date);
  q = c.branchId ? q.eq('branch_id', c.branchId) : q.is('branch_id', null);
  const { data: existing, error: e0, status: s0 } = await q.maybeSingle();
  if (e0) throw new Error(isMissingTableError(e0, s0) ? 'Table cash_closures absente : exécutez le script SQL V48.' : e0.message);
  if (existing) {
    if (!can('cash.reopen')) throw new Error('Cette journée est déjà clôturée : modification réservée aux profils autorisés (cash.reopen)');
    const { error } = await supabase.from('cash_closures').update(payload).eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('cash_closures').insert(payload);
    if (error) throw new Error(error.message);
  }
  await auditLog('Caisse', existing ? 'UPDATE' : 'CLOSE', 'Caisse ' + c.date, `Attendu ${fmt(payload.expected_cash)} · Compté ${fmt(payload.counted_cash)} · Écart ${fmt(payload.gap)}`);
  return payload;
}

function printCashClosure(L, c, branchName) {
  const t = c.totals_json || c.totals || {};
  const modes = Object.entries(t.byMode || {});
  const w = window.open('', '_blank', 'width=420,height=700');
  if (!w) return;
  w.document.write(`<html><head><title>Clôture ${escapeHtml(c.closure_date || c.date)}</title><style>
    @page{size:80mm auto;margin:4mm}body{font-family:Arial;font-size:12px;width:72mm;margin:0 auto}h3{text-align:center;margin:4px 0}
    table{width:100%;border-collapse:collapse}td{padding:2px 0}td.r{text-align:right}.sep{border-top:1px dashed #000;margin:6px 0}.b{font-weight:bold}</style></head><body>
    <h3>CLÔTURE DE CAISSE</h3><div style="text-align:center">${escapeHtml(branchName || '')}<br>${escapeHtml(c.closure_date || c.date)} · ${escapeHtml(c.created_by_label || currentUserLabel())}</div>
    <div class="sep"></div><table>${modes.map(([m, v]) => `<tr><td>${escapeHtml(m)} (${v.count})</td><td class="r">+${fmt(v.in)}${v.out ? ' / -' + fmt(v.out) : ''}</td></tr>`).join('') || '<tr><td>Aucun règlement</td></tr>'}</table>
    <div class="sep"></div><table>
    <tr><td>Fond de caisse</td><td class="r">${fmt(c.opening_cash ?? c.opening)}</td></tr>
    <tr><td>+ Encaissements espèces</td><td class="r">${fmt(t.cashIn)}</td></tr>
    <tr><td>- Décaissements espèces</td><td class="r">${fmt(t.cashOutPurchases)}</td></tr>
    <tr><td>- Charges espèces</td><td class="r">${fmt(t.cashExpenses)}</td></tr>
    <tr class="b"><td>Espèces attendues</td><td class="r">${fmt(c.expected_cash ?? c.expected)}</td></tr>
    <tr class="b"><td>Espèces comptées</td><td class="r">${fmt(c.counted_cash ?? c.counted)}</td></tr>
    <tr class="b"><td>Écart</td><td class="r">${fmt(c.gap ?? (Number(c.counted) - Number(c.expected)))}</td></tr></table>
    ${c.note ? '<div class="sep"></div><div>' + escapeHtml(c.note) + '</div>' : ''}
    <div class="sep"></div><div>Signature :</div><br><br>
    <script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}

function CashClosureModal({ L, payments, close }) {
  const session = getStoredSession();
  const admin = isAdmin(session);
  const [branches, setBranches] = useState([]);
  const [bId, setBId] = useState(currentBranchId() || '');
  const [date, setDate] = useState(today());
  const [expenses, setExpenses] = useState([]);
  const [history, setHistory] = useState({ rows: [], dbReady: true });
  const [opening, setOpening] = useState('');
  const [counted, setCounted] = useState('');
  const [bills, setBills] = useState({});
  const [showBills, setShowBills] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadBranches().then(b => { setBranches(b || []); if (admin && !bId && b?.[0]) setBId(b[0].id); }).catch(() => {}); }, []);
  useEffect(() => {
    let q = supabase.from('expenses').select('date, amount, mode, branch_id').eq('date', date);
    if (bId) q = q.eq('branch_id', bId);
    q.then(({ data }) => setExpenses(data || []));
    loadCashClosures(bId).then(h => {
      setHistory(h);
      const same = h.rows.find(r => r.closure_date === date);
      const prev = h.rows.find(r => r.closure_date < date);
      setOpening(same ? same.opening_cash : prev ? prev.counted_cash : 0);
      setCounted(same ? same.counted_cash : '');
      setNote(same?.note || '');
    }).catch(() => {});
  }, [date, bId]);

  const calc = computeCashClosure(payments, expenses, { date, branchId: bId, opening });
  const billsTotal = CASH_DENOMINATIONS.reduce((s, d) => s + d * Number(bills[d] || 0), 0);
  const countedValue = counted === '' ? null : Number(counted);
  const gap = countedValue === null ? null : countedValue - calc.expected;
  const already = history.rows.find(r => r.closure_date === date);
  const branchName = (branches.find(b => String(b.id) === String(bId)) || {}).name || session?.user?.branch_name || '';

  async function save() {
    if (countedValue === null) return alert(L('closureCountedRequired'));
    setBusy(true);
    try {
      const saved = await saveCashClosure({ date, branchId: bId || null, totals: calc, opening, expected: calc.expected, counted: countedValue, note });
      setHistory(await loadCashClosures(bId));
      printCashClosure(L, saved, branchName);
    } catch (e) { alert(e.message); }
    setBusy(false);
  }

  return (
    <Modal title={L('cashClosure')} onClose={close} wide>
      {!history.dbReady ? <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 text-sm mb-3">{L('closureNotReady')}</div> : null}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input type="date" className="input max-w-[170px]" value={date} onChange={e => setDate(e.target.value)} />
        {admin ? (
          <select className="input max-w-[200px]" value={bId || ''} onChange={e => setBId(e.target.value ? Number(e.target.value) : '')}>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        ) : null}
        {already ? <Badge tone="green">✔ {L('closureDone')} · {already.created_by_label || ''}</Badge> : null}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold mb-2">{L('closureByMode')}</h3>
          <table className="w-full text-sm border rounded-lg">
            <thead className="bg-slate-50"><tr><th className="p-2 text-start">Mode</th><th className="p-2 text-end">{L('cashIn')}</th><th className="p-2 text-end">{L('cashOut')}</th></tr></thead>
            <tbody>
              {Object.entries(calc.byMode).map(([m, v]) => <tr key={m} className="border-t"><td className="p-2">{m} <span className="text-xs text-slate-400">({v.count})</span></td><td className="p-2 text-end font-mono">{dh(v.in)}</td><td className="p-2 text-end font-mono">{v.out ? dh(v.out) : '-'}</td></tr>)}
              {!calc.paymentsCount ? <tr><td colSpan={3} className="p-3 text-center text-slate-400">{L('noData')}</td></tr> : null}
              <tr className="border-t font-bold"><td className="p-2">Total</td><td className="p-2 text-end font-mono">{dh(calc.totalIn)}</td><td className="p-2 text-end font-mono">{dh(calc.totalOut)}</td></tr>
              {calc.expensesTotal ? <tr className="border-t"><td className="p-2">{L('charges')}</td><td /><td className="p-2 text-end font-mono">{dh(calc.expensesTotal)}</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="font-bold mb-2">{L('closureCash')}</h3>
          <div className="space-y-2 text-sm">
            <label className="flex justify-between items-center gap-2">{L('closureOpening')}<input className="input w-36 text-end" type="number" step="0.01" value={opening} onChange={e => setOpening(e.target.value)} /></label>
            <div className="flex justify-between"><span>+ {L('closureCashIn')}</span><b className="font-mono">{dh(calc.cashIn)}</b></div>
            <div className="flex justify-between"><span>− {L('closureCashOut')}</span><b className="font-mono">{dh(calc.cashOutPurchases)}</b></div>
            <div className="flex justify-between"><span>− {L('closureCashExpenses')}</span><b className="font-mono">{dh(calc.cashExpenses)}</b></div>
            <div className="flex justify-between border-t pt-2 text-base"><span className="font-bold">{L('closureExpected')}</span><b className="font-mono">{dh(calc.expected)}</b></div>
            <label className="flex justify-between items-center gap-2 font-bold">{L('closureCounted')}<input className="input w-36 text-end" type="number" step="0.01" value={counted} onChange={e => setCounted(e.target.value)} /></label>
            <button onClick={() => setShowBills(!showBills)} className="text-xs text-amber-700 underline">{L('closureBills')}</button>
            {showBills ? (
              <div className="grid grid-cols-3 gap-1 bg-slate-50 rounded-lg p-2">
                {CASH_DENOMINATIONS.map(d => <label key={d} className="text-xs flex items-center gap-1">{d} ×<input className="input py-1 text-end" type="number" min="0" value={bills[d] ?? ''} onChange={e => setBills({ ...bills, [d]: e.target.value })} /></label>)}
                <button onClick={() => setCounted(Number(billsTotal.toFixed(2)))} className="btn bg-white border col-span-3">= {dh(billsTotal)} → {L('closureCounted')}</button>
              </div>
            ) : null}
            {gap !== null ? <div className={'flex justify-between text-base rounded-lg p-2 ' + (Math.abs(gap) < 0.01 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700')}><span className="font-bold">{L('closureGap')}</span><b className="font-mono">{gap > 0 ? '+' : ''}{dh(gap)}</b></div> : null}
            <input className="input" placeholder={L('note')} value={note} onChange={e => setNote(e.target.value)} />
            {already && !can('cash.reopen') ? <p className="text-xs text-slate-500 mb-1">🔒 {L('closureLocked')}</p> : null}
            <button disabled={busy || (already && !can('cash.reopen'))} onClick={save} className="btn bg-amber-500 w-full">{busy ? '…' : (already ? L('closureUpdate') : L('closureValidate'))}</button>
          </div>
        </div>
      </div>

      {history.rows.length ? (
        <div className="mt-5">
          <h3 className="font-bold mb-2">{L('history')}</h3>
          <div className="max-h-48 overflow-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0"><tr><th className="p-2 text-start">{L('date')}</th><th className="p-2 text-end">{L('closureExpected')}</th><th className="p-2 text-end">{L('closureCounted')}</th><th className="p-2 text-end">{L('closureGap')}</th><th className="p-2 text-start">{L('createdBy')}</th><th /></tr></thead>
              <tbody>
                {history.rows.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.closure_date}</td><td className="p-2 text-end">{fmt(r.expected_cash)}</td><td className="p-2 text-end">{fmt(r.counted_cash)}</td>
                    <td className={'p-2 text-end font-bold ' + (Math.abs(Number(r.gap)) < 0.01 ? 'text-green-700' : 'text-red-600')}>{fmt(r.gap)}</td>
                    <td className="p-2">{r.created_by_label || '-'}</td>
                    <td className="p-2"><button onClick={() => printCashClosure(L, r, branchName)} className="text-amber-700">🖨</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

/* ===================== Réapprovisionnement automatique ===================== */
// Calcul pur : stock disponible = stock − réservé (commandes clients) + déjà commandé (commandes fournisseurs ouvertes)
function planReorder(products, { onOrder = {}, reserved = {}, lastPurchase = {} } = {}) {
  return (products || []).map(p => {
    const stock = Number(p.quantite || 0);
    const min = Number(p.stockMin || 0);
    const res = Number(reserved[p.id] || 0);
    const ord = Number(onOrder[p.id] || 0);
    const available = stock - res + ord;
    if (!(min > 0 || available < 0) || available > min) return null;
    const qty = Math.max(1, Math.ceil(Math.max(min * 2, min + 1) - available));
    const last = lastPurchase[p.id] || {};
    const supplierId = p.fournisseurId || last.supplierId || null;
    return { produitId: p.id, ref: p.ref, nom: p.nom, unite: p.unite, stock, min, reserved: res, onOrder: ord, available, qte: qty, prixUnit: Number(last.price || p.prixAchat || 0), supplierId, include: true };
  }).filter(Boolean);
}

async function loadReorderContext(bId) {
  let q = supabase.from('purchases').select('id, stage, supplier_id, lines_json, processed_lines_json, branch_id').order('id', { ascending: false }).limit(1000);
  if (bId) q = q.eq('branch_id', bId);
  const [{ data: purchases, error }, reserved] = await Promise.all([q, reservedQtyByProduct(null)]);
  if (error) throw new Error(error.message);
  const onOrder = {}; const lastPurchase = {};
  (purchases || []).forEach(d => {
    if (d.stage === 'commande') {
      docRemainingLines(d).forEach(l => { onOrder[l.produitId] = Number(onOrder[l.produitId] || 0) + Number(l.remainingQty || 0); });
    }
    if (['commande', 'reception', 'facture'].includes(d.stage)) {
      normalizeLines(jsonValue(d.lines_json, [])).forEach(l => {
        if (l.produitId && !lastPurchase[l.produitId]) lastPurchase[l.produitId] = { supplierId: d.supplier_id, price: Number(l.prixUnit || 0) };
      });
    }
  });
  return { onOrder, reserved, lastPurchase };
}

async function createReorderOrders(lines, suppliers, bId) {
  requirePerm('purchases.write', 'Commande fournisseur');
  requireUse('stock.reorder', 'Réapprovisionnement');
  const chosen = lines.filter(l => l.include && Number(l.qte) > 0);
  if (!chosen.length) throw new Error('Aucune ligne sélectionnée');
  if (chosen.some(l => !l.supplierId)) throw new Error('Choisissez un fournisseur pour chaque ligne sélectionnée');
  const groups = {};
  chosen.forEach(l => { (groups[l.supplierId] = groups[l.supplierId] || []).push(l); });
  const created = [];
  for (const [supId, ls] of Object.entries(groups)) {
    const sup = suppliers.find(s => String(s.id) === String(supId));
    const res = await createDoc('purchases', {
      start: 'commande', fournisseurId: Number(supId), fournisseurNom: sup?.name || '', branchId: bId || undefined,
      lignes: ls.map(l => ({ produitId: l.produitId, ref: l.ref, nom: l.nom, unite: l.unite, qte: Number(l.qte), prixUnit: Number(l.prixUnit || 0) }))
    });
    created.push({ number: res?.number, supplier: sup?.name || supId, lines: ls.length });
  }
  return created;
}

function ReorderModal({ L, products, branches, suppliers, close, done }) {
  const admin = isAdmin(getStoredSession());
  const [bId, setBId] = useState(currentBranchId() || branches[0]?.id || '');
  const [lines, setLines] = useState(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setLines(null); setErr('');
    loadReorderContext(bId).then(ctx => {
      setLines(planReorder(products.filter(p => !bId || String(p.branchId) === String(bId)), ctx));
    }).catch(e => setErr(e.message));
  }, [bId]);

  const upd = (i, patch) => setLines(ls => ls.map((l, j) => j === i ? { ...l, ...patch } : l));
  const chosen = (lines || []).filter(l => l.include && Number(l.qte) > 0);
  const totalHT = chosen.reduce((s, l) => s + Number(l.qte) * Number(l.prixUnit || 0), 0);
  const nbSuppliers = new Set(chosen.map(l => l.supplierId || '?')).size;
  const allSupplier = v => setLines(ls => ls.map(l => (l.include && !l.supplierId ? { ...l, supplierId: v } : l)));

  async function run() {
    setBusy(true);
    try {
      const r = await createReorderOrders(lines, suppliers, bId);
      setCreated(r);
      done && done();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }

  return (
    <Modal title={L('reorderAuto')} onClose={close} wide>
      <p className="text-sm text-slate-500 mb-3">{L('reorderHint')}</p>
      {admin ? (
        <select className="input max-w-[220px] mb-3" value={bId || ''} onChange={e => setBId(e.target.value ? Number(e.target.value) : '')}>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      ) : null}
      {err ? <ErrorBox msg={err} /> : null}
      {created ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="font-bold text-green-800 mb-1">{L('reorderCreated')}</p>
          {created.map(c => <div key={c.number}>• {c.number} — {c.supplier} ({c.lines} {L('products')})</div>)}
          <p className="text-xs text-slate-500 mt-2">{L('reorderSeePurchases')}</p>
        </div>
      ) : !lines ? <p className="text-slate-400 text-sm">…</p> : !lines.length ? (
        <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-3 text-sm">{L('reorderNothing')}</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-2 items-center text-sm">
            <span className="text-slate-500">{L('reorderSupplierAll')} :</span>
            <select className="input max-w-[220px]" value="" onChange={e => e.target.value && allSupplier(Number(e.target.value))}>
              <option value="">--</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="max-h-[50vh] overflow-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0"><tr>
                <th className="p-2" /><th className="p-2 text-start">{L('product')}</th><th className="p-2 text-end">{L('stock')}</th>
                <th className="p-2 text-end">{L('minStock')}</th><th className="p-2 text-end">{L('reorderReserved')}</th><th className="p-2 text-end">{L('reorderOnOrder')}</th>
                <th className="p-2 text-end">{L('reorderQty')}</th><th className="p-2 text-end">{L('unitPrice')} HT</th><th className="p-2 text-start">{L('supplier')}</th>
              </tr></thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={l.produitId} className={'border-t ' + (l.include ? '' : 'opacity-50')}>
                    <td className="p-2"><input type="checkbox" checked={l.include} onChange={e => upd(i, { include: e.target.checked })} /></td>
                    <td className="p-2"><div className="font-semibold">{l.nom}</div><div className="text-slate-400 font-mono">{l.ref}</div></td>
                    <td className={'p-2 text-end ' + (l.stock <= 0 ? 'text-red-600 font-bold' : '')}>{fmt(l.stock)}</td>
                    <td className="p-2 text-end">{fmt(l.min)}</td>
                    <td className="p-2 text-end">{l.reserved ? fmt(l.reserved) : '-'}</td>
                    <td className="p-2 text-end">{l.onOrder ? fmt(l.onOrder) : '-'}</td>
                    <td className="p-2 text-end"><input className="input w-20 text-end py-1" type="number" min="0" value={l.qte} onChange={e => upd(i, { qte: e.target.value })} /></td>
                    <td className="p-2 text-end"><input className="input w-24 text-end py-1" type="number" min="0" step="0.01" value={l.prixUnit} onChange={e => upd(i, { prixUnit: e.target.value })} /></td>
                    <td className="p-2">
                      <select className={'input py-1 ' + (l.include && !l.supplierId ? 'border-red-400' : '')} value={l.supplierId || ''} onChange={e => upd(i, { supplierId: e.target.value ? Number(e.target.value) : null })}>
                        <option value="">--</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
            <div className="text-sm">{chosen.length} {L('products')} · {nbSuppliers} {L('suppliers')} · <b>{dh(totalHT)} HT</b></div>
            <button disabled={busy || !chosen.length} onClick={run} className="btn bg-amber-500">{busy ? '…' : L('reorderCreate')}</button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ===================== Caisse rapide (vente comptoir) ===================== */
function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Ticket 80 mm imprimé dans une fenêtre dédiée (indépendant de la mise en page de l'app)
function printTicket(t) {
  const c = t.company || {};
  const rows = (t.lines || []).map(l => {
    const r = lineDiscount(l);
    return `<tr><td colspan="3" class="n">${escapeHtml(l.nom)}</td></tr>
      <tr><td>${fmt(l.qte)} ${escapeHtml(l.unite || '')} x ${fmt(l.prixUnit)}${r ? ` <i>-${fmt(r)}%</i>` : ''}</td><td></td><td class="r">${fmt(lineNet(l))}</td></tr>`;
  }).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(t.number)}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    body { width: 72mm; margin: 4mm; font-family: 'Courier New', monospace; font-size: 12px; color: #000; }
    h1 { font-size: 16px; text-align: center; margin: 0 0 2px; }
    .c { text-align: center; } .r { text-align: right; } .n { font-weight: bold; padding-top: 4px; }
    table { width: 100%; border-collapse: collapse; } hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
    .tot td { font-size: 14px; font-weight: bold; } i { font-style: normal; }
  </style></head><body>
  <h1>${escapeHtml(c.name || 'DrogueriePro')}</h1>
  <div class="c">${escapeHtml(c.address || '')}</div>
  <div class="c">${c.phone ? 'Tél : ' + escapeHtml(c.phone) : ''}</div>
  <div class="c">${c.ice ? 'ICE : ' + escapeHtml(c.ice) : ''}</div>
  <hr><div>Ticket : <b>${escapeHtml(t.number)}</b></div>
  <div>Date : ${escapeHtml(t.date)}</div>
  <div>Client : ${escapeHtml(t.client || 'Client comptoir')}</div>
  <div>Caissier : ${escapeHtml(t.cashier || '')}</div><hr>
  <table>${rows}</table><hr>
  <table>
    <tr><td>Total HT</td><td class="r">${fmt(t.totals.totalHT)}</td></tr>
    <tr><td>TVA</td><td class="r">${fmt(t.totals.vat)}</td></tr>
    <tr class="tot"><td>TOTAL TTC</td><td class="r">${fmt(t.totals.totalTTC)} DH</td></tr>
    <tr><td>Paiement</td><td class="r">${escapeHtml(t.payMode)}</td></tr>
    ${t.payMode === 'Espèces' && Number(t.received) > 0 ? `<tr><td>Reçu</td><td class="r">${fmt(t.received)}</td></tr><tr><td>Rendu</td><td class="r">${fmt(t.change)}</td></tr>` : ''}
  </table><hr>
  <div class="c">Merci de votre visite</div>
  <script>window.onload = function () { window.print(); setTimeout(function () { window.close(); }, 500); };</script>
  </body></html>`;
  const w = window.open('', '_blank', 'width=380,height=640');
  if (!w) { alert('Autorisez les fenêtres pop-up pour imprimer le ticket'); return; }
  w.document.open(); w.document.write(html); w.document.close();
}

// Lecture code-barres par la caméra (navigateurs compatibles : Chrome Android, Edge…)
function CameraScanner({ L, onCode, close }) {
  const videoRef = React.useRef(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let stream; let timer; let stopped = false;
    (async () => {
      try {
        if (!('BarcodeDetector' in window)) { setErr(L('cameraUnsupported')); return; }
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (stopped) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        timer = setInterval(async () => {
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length) { clearInterval(timer); onCode(codes[0].rawValue); close(); }
          } catch {}
        }, 300);
      } catch (e) { setErr(e.message || String(e)); }
    })();
    return () => { stopped = true; if (timer) clearInterval(timer); if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);
  return (
    <Modal title={L('cameraScan')} onClose={close}>
      {err ? <ErrorBox msg={err} /> : <video ref={videoRef} playsInline muted style={{ width: '100%', borderRadius: 12, background: '#000' }} />}
      <p className="text-xs text-slate-500 mt-2">{L('cameraHint')}</p>
    </Modal>
  );
}

function PosCenter({ L }) {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [company, setCompany] = useState(null);
  const [vatRate, setVatRate] = useState(20);
  const [cart, setCart] = useState([]);
  const [clientId, setClientId] = useState('');
  const [search, setSearch] = useState('');
  const [payMode, setPayMode] = useState('Espèces');
  const [received, setReceived] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState('');
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);
  const [err, setErr] = useState('');
  const searchRef = React.useRef(null);

  async function load() {
    try {
      const session = getStoredSession();
      const [{ data, error }, cl, comp, vat] = await Promise.all([
        applyProductScope(supabase.from('products').select('*, branches(name)'), session).order('name'),
        loadParties('clients').catch(() => []),
        loadCompanySettings().catch(() => ({ name: 'DrogueriePro' })),
        getVatRate()
      ]);
      if (error) throw error;
      setProducts((data || []).map(mapProduct));
      setClients(cl || []);
      setCompany(comp);
      setVatRate(Number(vat || 20));
    } catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  const client = clients.find(c => String(c.id) === String(clientId)) || null;

  function addProduct(p, qty = 1) {
    if (!p) return;
    setCart(prev => {
      const idx = prev.findIndex(l => String(l.produitId) === String(p.id));
      if (idx >= 0) return prev.map((l, i) => i === idx ? { ...l, qte: Number(l.qte || 0) + qty } : l);
      return [...prev, { produitId: p.id, ref: p.ref, nom: p.nom, nomAr: p.nomAr, unite: p.unite, categorie: p.categorie, prixUnit: priceForParty(p, client, true), prixAchat: p.prixAchat, remise: Number(globalDiscount || 0), qte: qty, stock: p.quantite }];
    });
  }

  function findByCode(code) {
    const c = String(code || '').trim().toLowerCase();
    if (!c) return null;
    return products.find(x => String(x.barcode || '').toLowerCase() === c) || products.find(x => String(x.ref || '').toLowerCase() === c) || null;
  }

  function onSearchEnter() {
    const exact = findByCode(search);
    if (exact) { addProduct(exact); setSearch(''); return; }
    if (results.length === 1) { addProduct(results[0]); setSearch(''); }
  }

  function changeClient(id) {
    setClientId(id);
    const c = clients.find(x => String(x.id) === String(id)) || null;
    setCart(prev => prev.map(l => ({ ...l, prixUnit: priceForParty(products.find(p => String(p.id) === String(l.produitId)), c, true) })));
  }

  function applyGlobalDiscount(v) {
    setGlobalDiscount(v);
    setCart(prev => prev.map(l => ({ ...l, remise: Math.min(100, Math.max(0, Number(v || 0))) })));
  }

  const q = search.trim().toLowerCase();
  const results = q ? products.filter(p => [p.nom, p.nomAr, p.ref, p.barcode, p.categorie].join(' ').toLowerCase().includes(q)).slice(0, 24) : products.slice(0, 24);
  const totals = computeTotals(cart, vatRate, true);
  const change = Math.max(0, Number(received || 0) - totals.totalTTC);

  async function validate(opts = {}) {
    if (!cart.length) return alert(L('emptyCart'));
    if (payMode === 'Crédit' && !client) return alert(L('creditNeedsClient'));
    if (payMode !== 'Crédit' && !can('sales.pay')) return alert('Autorisation insuffisante : sales.pay');
    if (payMode === 'Crédit' && !can('pos.credit')) return alert('Autorisation insuffisante : pos.credit');
    if (payMode === 'Espèces' && received !== '' && Number(received) + 0.001 < totals.totalTTC) return alert(L('notEnoughCash'));
    setBusy(true);
    try {
      const res = await createDoc('sales', {
        start: 'facture',
        date: today(),
        tauxTva: vatRate,
        lignes: cart.map(l => ({ produitId: l.produitId, ref: l.ref, nom: l.nom, nomAr: l.nomAr, unite: l.unite, categorie: l.categorie, prixUnit: Number(l.prixUnit), remise: Number(l.remise || 0), prixAchat: Number(l.prixAchat || 0), qte: Number(l.qte) })),
        clientId: client?.id || null,
        clientNom: client?.name || L('walkInClient'),
        paidNow: payMode === 'Crédit' ? 0 : totals.totalTTC,
        forceCredit: !!opts.forceCredit
      });
      if (payMode !== 'Crédit') await payDoc('sales', res.id, { date: today(), mode: payMode, montant: Number(res.totals.totalTTC.toFixed(2)), note: 'Caisse rapide' });
      const ticket = {
        company, number: res.number, date: new Date().toLocaleString('fr-FR'), client: client?.name || L('walkInClient'),
        cashier: currentUserLabel(), lines: cart, totals: res.totals, payMode,
        received: payMode === 'Espèces' ? Number(received || res.totals.totalTTC) : 0,
        change: payMode === 'Espèces' ? Math.max(0, Number(received || 0) - res.totals.totalTTC) : 0
      };
      setLastTicket(ticket);
      printTicket(ticket);
      setCart([]); setReceived(''); setGlobalDiscount(''); setSearch('');
      load();
      setTimeout(() => searchRef.current?.focus(), 100);
    } catch (e) {
      if (e.code === 'CREDIT_LIMIT' && canOverrideCreditLimit()) {
        setBusy(false);
        if (confirm(e.message + '\n\n' + L('creditOverride'))) return validate({ forceCredit: true });
        return;
      }
      alert(e.message);
    }
    setBusy(false);
  }

  // Raccourcis : F2 = recherche, F9 = valider, Échap = vider la recherche
  useEffect(() => {
    const h = e => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F9') { e.preventDefault(); validate(); }
      if (e.key === 'Escape') setSearch('');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  if (err) return <ErrorBox msg={err} />;

  return (
    <>
      <Header title={L('posMod')}>
        {lastTicket ? <button onClick={() => printTicket(lastTicket)} className="btn bg-white border">🖨 {L('lastTicket')}</button> : null}
        <button onClick={load} className="btn bg-white border">↻</button>
      </Header>

      {lastTicket && !cart.length ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-3 mb-4 flex flex-wrap gap-x-6 gap-y-1 items-center">
          <b>✔ {lastTicket.number}</b>
          <span>{L('totalTTC')} : <b>{dh(lastTicket.totals.totalTTC)}</b> · {lastTicket.payMode}</span>
          {lastTicket.change > 0 ? <span className="text-lg">{L('changeDue')} : <b>{dh(lastTicket.change)}</b></span> : null}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <div className="card p-3 mb-3 flex gap-2">
            <input ref={searchRef} autoFocus className="input text-lg" placeholder={'🔎 ' + L('posSearch')} value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onSearchEnter(); } }} />
            <button onClick={() => setCamera(true)} className="btn bg-slate-800 text-white" title={L('cameraScan')}>📷</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {results.map(p => (
              <button key={p.id} onClick={() => { addProduct(p); searchRef.current?.focus(); }} className="card p-3 text-left hover:border-amber-400" style={{ minHeight: 92 }}>
                <div className="font-semibold text-sm leading-tight">{p.nom}</div>
                {p.nomAr ? <div className="text-xs text-slate-400">{p.nomAr}</div> : null}
                <div className="flex justify-between items-end mt-2">
                  <span className="font-black text-amber-600">{dh(priceForParty(p, client, true))}</span>
                  <span className={'text-xs ' + (Number(p.quantite) <= 0 ? 'text-red-600 font-bold' : 'text-slate-400')}>{fmt(p.quantite)} {p.unite}</span>
                </div>
              </button>
            ))}
            {!results.length ? <p className="text-sm text-slate-500 p-4">{L('noData')}</p> : null}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-4" style={{ position: 'sticky', top: 12 }}>
            <label className="text-xs text-slate-500">{L('customer')}
              <select className="input mt-1 mb-3" value={clientId} onChange={e => changeClient(e.target.value)}>
                <option value="">{L('walkInClient')}</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.price_tier === 'gros' ? ' (' + L('wholesale') + ')' : ''}</option>)}
              </select>
            </label>

            <div className="space-y-2 max-h-80 overflow-auto mb-3">
              {cart.map((l, i) => (
                <div key={l.produitId} className="border rounded-lg p-2">
                  <div className="flex justify-between gap-2">
                    <div className="text-sm font-semibold leading-tight">{l.nom}</div>
                    <button onClick={() => setCart(cart.filter((_, j) => j !== i))} className="text-red-600">✕</button>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <button className="btn bg-white border px-2" onClick={() => setCart(cart.map((x, j) => j === i ? { ...x, qte: Math.max(0, Number(x.qte) - 1) || 1 } : x))}>−</button>
                    <input className="input text-center" style={{ width: 64 }} type="number" min="0" step="0.01" value={l.qte} onChange={e => setCart(cart.map((x, j) => j === i ? { ...x, qte: e.target.value } : x))} />
                    <button className="btn bg-white border px-2" onClick={() => setCart(cart.map((x, j) => j === i ? { ...x, qte: Number(x.qte) + 1 } : x))}>+</button>
                    <span className="text-xs text-slate-400">× </span>
                    <input className="input" style={{ width: 80 }} type="number" min="0" step="0.01" value={l.prixUnit} readOnly={!can('sales.price_edit')} onChange={e => setCart(cart.map((x, j) => j === i ? { ...x, prixUnit: e.target.value } : x))} />
                    {can('pos.discount') ? <input className="input" style={{ width: 58 }} type="number" min="0" max="100" title={L('discount') + ' %'} placeholder="%" value={l.remise || ''} onChange={e => setCart(cart.map((x, j) => j === i ? { ...x, remise: e.target.value } : x))} /> : null}
                    <b className="ml-auto">{fmt(lineNet(l))}</b>
                  </div>
                  {Number(l.qte) > Number(l.stock || 0) ? <div className="text-xs text-red-600 mt-1">{L('stock')} : {fmt(l.stock)}</div> : null}
                </div>
              ))}
              {!cart.length ? <p className="text-sm text-slate-400 text-center py-6">{L('emptyCart')}</p> : null}
            </div>

            {can('pos.discount') ? (
              <div className="flex items-center gap-2 mb-2 text-sm">
                <span className="text-slate-500">{L('globalDiscount')}</span>
                <input className="input" style={{ width: 80 }} type="number" min="0" max="100" value={globalDiscount} onChange={e => applyGlobalDiscount(e.target.value)} />
              </div>
            ) : null}

            <div className="border-t pt-2 text-sm space-y-1">
              <div className="flex justify-between"><span>{L('totalHT')}</span><span>{dh(totals.totalHT)}</span></div>
              <div className="flex justify-between"><span>{L('totalVAT')}</span><span>{dh(totals.vat)}</span></div>
              <div className="flex justify-between text-2xl font-black"><span>{L('totalTTC')}</span><span>{dh(totals.totalTTC)}</span></div>
            </div>

            <div className="grid grid-cols-3 gap-1 my-3">
              {['Espèces', 'Carte', 'Chèque', 'Virement', 'Crédit'].filter(m => m !== 'Crédit' || can('pos.credit')).map(m => (
                <button key={m} onClick={() => setPayMode(m)} className={'btn text-sm ' + (payMode === m ? 'bg-slate-900 text-white' : 'bg-white border')}>{L('pm_' + m)}</button>
              ))}
            </div>

            {payMode === 'Espèces' ? (
              <div className="grid grid-cols-2 gap-2 mb-3 items-end">
                <label className="text-xs text-slate-500">{L('cashReceived')}
                  <input className="input mt-1 text-lg" type="number" min="0" step="0.01" value={received} onChange={e => setReceived(e.target.value)} placeholder={fmt(totals.totalTTC)} />
                </label>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{L('changeDue')}</div>
                  <div className="text-2xl font-black text-emerald-700">{dh(change)}</div>
                </div>
              </div>
            ) : null}

            <button disabled={busy || !cart.length} onClick={() => validate()} className="btn bg-amber-500 w-full text-lg py-3">
              {busy ? '…' : L('posValidate') + ' (F9)'}
            </button>
            <p className="text-xs text-slate-400 mt-2 text-center">{L('posShortcuts')}</p>
          </div>
        </div>
      </div>

      {camera ? <CameraScanner L={L} close={() => setCamera(false)} onCode={code => { const p = findByCode(code); if (p) addProduct(p); else alert(L('productNotFound') + ' : ' + code); }} /> : null}
    </>
  );
}


function Docs({ L, type }) {
  const isSales = type === 'sales';
  const canWriteDoc = can(isSales ? 'sales.write' : 'purchases.write');
  const canDeleteDoc = can(isSales ? 'sales.delete' : 'purchases.delete');
  const canPayDoc = can(isSales ? 'sales.pay' : 'purchases.pay');
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [parties, setParties] = useState([]);
  const [form, setForm] = useState(null);
  const [pay, setPay] = useState(null);
  const [partial, setPartial] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tab, setTab] = useState('all');
  const [err, setErr] = useState('');
  const [userFilter, setUserFilter] = useState(getSelectedUserFilter(type));

  async function load() {
    try {
      const session = getStoredSession();
      const partiesQueryBase = supabase.from(isSales ? 'clients' : 'suppliers').select('*').order('name');
      const partiesQuery = (!isAdmin(session) && branchId(session)) ? partiesQueryBase.eq('branch_id', branchId(session)) : partiesQueryBase;

      const [{ data: docs, error: dErr }, { data: prod, error: pErr }, { data: party, error: tErr }, userLabels] = await Promise.all([
        applyDocScope(supabase.from(type).select('*'), type, session).order('id', { ascending: false }),
        applyProductScope(supabase.from('products').select('*, branches(name)'), session).order('name'),
        partiesQuery,
        loadUserLabels()
      ]);
      if (dErr) throw dErr;
      if (pErr) throw pErr;
      if (tErr) throw tErr;
      setRows(enrichDocs(docs || [], userLabels));
      setProducts((prod || []).map(mapProduct));
      // Vendeur : uniquement ses clients (affectés à lui ou créés par lui). Admin/Gérant : tous.
      setParties(isSales ? (party || []).filter(x => canSeePartyRecord(x, 'clients', session)) : (party || []));
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, [type]);

  const tabs = isSales
    ? [['all', L('all')], ['devis', L('quotes')], ['commande', L('orders')], ['livraison', L('deliveries')], ['facture', L('invoices')], ['avoir', L('creditNotes')]]
    : [['all', L('all')], ['commande', L('orders')], ['reception', L('receipts')], ['facture', L('invoices')], ['retour', L('supplierReturns')]];

  const filtered = applyUserFilterToRows((tab === 'all' ? rows : rows.filter(x => x.stage === tab)).filter(x => {
    if (tab === 'commande' && docStatus(x) === 'closed') return false;
    if (tab === 'reception' && docStatus(x) === 'closed') return false;
    if (tab === 'livraison' && docStatus(x) === 'closed' && x.stage === 'commande') return false;
    return true;
  }), type);

  function create(start) {
    setForm({ start, date: today(), partyId: parties[0]?.id || '', lignes: [{ produitId: products[0]?.id || '', qte: 1 }] });
  }

  async function save(opts = {}) {
    try {
      const partyForPrice = parties.find(p => String(p.id) === String(form.partyId));
      const lines = form.lignes.map(l => {
        const product = products.find(p => String(p.id) === String(l.produitId));
        if (!product) throw new Error('Produit non sélectionné');
        return {
          produitId: product.id,
          ref: product.ref,
          nom: product.nom,
          nomAr: product.nomAr || '',
          unite: product.unite || '',
          categorie: product.categorie || '',
          prixUnit: Number(l.prixUnit ?? priceForParty(product, partyForPrice, isSales)),
          remise: Math.min(100, Math.max(0, Number(l.remise || 0))),
          // Coût de revient figé au PMP du moment (calcul de marge fiable)
          prixAchat: Number(product.prixAchat || 0),
          qte: Number(l.qte)
        };
      });
      const party = parties.find(p => String(p.id) === String(form.partyId));
      if (!party) throw new Error(isSales ? 'Client non sélectionné' : 'Fournisseur non sélectionné');

      const body = {
        start: form.start,
        date: form.date,
        lignes: lines,
        tauxTva: 20,
        clientId: party.id,
        clientNom: party.name,
        fournisseurId: party.id,
        fournisseurNom: party.name,
        forceCredit: !!opts.forceCredit
      };

      if (form.id) await updateDoc(type, form.id, body);
      else await createDoc(type, body);

      setForm(null);
      load();
    } catch (e) {
      if (e.code === 'CREDIT_LIMIT' && canOverrideCreditLimit()) {
        if (confirm(e.message + '\n\n' + L('creditOverride'))) return save({ forceCredit: true });
        return;
      }
      alert(e.message);
    }
  }

  async function advance(id, opts = {}) {
    try { await advanceDoc(type, id, opts); load(); }
    catch (e) {
      if (e.code === 'CREDIT_LIMIT' && canOverrideCreditLimit()) {
        if (confirm(e.message + '\n\n' + L('creditOverride'))) return advance(id, { forceCredit: true });
        return;
      }
      alert(e.message);
    }
  }

  async function remove(id) {
    if (!confirm('Supprimer ?')) return;
    try { await deleteDoc(type, id); load(); }
    catch (e) { alert(e.message); }
  }

  async function settle() {
    try {
      await payDoc(type, pay.id, { date: pay.date, mode: pay.mode, montant: Number(pay.montant), cashRegister: pay.cashRegister, receiptNo: pay.receiptNo, chequeNo: pay.chequeNo, bank: pay.bank, dueDate: pay.dueDate, paymentStatus: pay.paymentStatus, transferRef: pay.transferRef, valueDate: pay.valueDate, terminal: pay.terminal, transactionNo: pay.transactionNo, billNo: pay.billNo, note: pay.note });
      setPay(null);
      load();
    } catch (e) { alert(e.message); }
  }

  async function doPartial(opts = {}) {
    try {
      const fn = partial.mode === 'invoice' ? partialInvoiceDoc : (partial.mode === 'return' ? returnDoc : partialDoc);
      await fn(type, partial.doc.id, {
        date: partial.date || today(),
        lignes: partial.lignes || [],
        restock: partial.restock !== false,
        forceCredit: !!opts.forceCredit
      });
      setPartial(null);
      load();
    } catch (e) {
      if (e.code === 'CREDIT_LIMIT' && canOverrideCreditLimit()) {
        if (confirm(e.message + '\n\n' + L('creditOverride'))) return doPartial({ forceCredit: true });
        return;
      }
      alert(e.message);
    }
  }

  if (err) return <ErrorBox msg={err} />;

  return (
    <>
      <Header title={isSales ? L('sales') : L('purchases')}>
        <button onClick={() => create(isSales ? 'devis' : 'commande')} className="btn bg-white border">{L('create')}</button>
        <button onClick={() => create(isSales ? 'facture' : 'reception')} className="btn bg-amber-500">{L('direct')}</button>
      </Header>

      <div className="flex gap-1 mb-4 flex-wrap">
        {tabs.map(t => <button key={t[0]} onClick={() => setTab(t[0])} className={'px-3 py-1.5 rounded-lg text-sm ' + (tab === t[0] ? 'bg-slate-800 text-white' : 'bg-white border text-slate-500')}>{t[1]}</button>)}
      </div>

      <Table>
        <thead>
          <tr>
            <th>{L('docType')}</th>
            <th>N°</th>
            <th>{L('baseDocNo')}</th>
            <th>{L('createdBy')}</th>
            <th>{L('date')}</th>
            <th>{isSales ? L('customer') : L('supplier')}</th>
            <th>{L('status')}</th>
            <th>{L('quantity')}</th>
            <th>{L('totalTTC')}</th>
            {tab === 'facture' ? <th>{L('payment')}</th> : null}
            <th>{L('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(d => {
            const status = d.statutPaiement === 'paid' ? L('paid') : d.statutPaiement === 'partial' ? L('partial') : L('unpaid');
            const tone = d.statutPaiement === 'paid' ? 'green' : d.statutPaiement === 'partial' ? 'amber' : 'red';
            return (
              <tr key={d.id}>
                <td><Badge tone="blue">{docTypeLabel(d, type, L)}</Badge></td>
                <td className="font-mono text-xs font-bold">{docNo(d)}</td>
                <td>{d.baseDocId ? <Badge tone="slate">{d.baseDocNumber || ('#' + d.baseDocId)}</Badge> : '-'}</td>
                <td>
                  <div className="font-semibold">{d.createdByLabel || '-'}</div>
                  <div className="text-xs text-slate-400">{L('createdBy')}</div>
                </td>
                <td>{d.date}</td>
                <td>
                  <div className="font-semibold">{d.client_name || d.supplier_name || d.clientNom || d.fournisseurNom}</div>
                  <div className="text-xs text-slate-400">{isSales ? L('customer') : L('supplier')}</div>
                </td>
                <td><Badge tone={docStatus(d) === 'closed' ? 'green' : docStatus(d) === 'partial' ? 'amber' : 'blue'}>{docStatus(d) === 'closed' ? L('closed') : docStatus(d) === 'partial' ? L('partial') : L('open')}</Badge></td>
                <td className="text-xs">
                  <div>{L('quantity')}: <b>{docQty(d.lignes)}</b></div>
                  <div>{L('remainingQty')}: <b>{docRemainingQty(d)}</b></div>
                  {(d.stage === 'livraison' || d.stage === 'reception') ? <div className={docInvoiceRemainingQty(d) > 0 ? 'text-amber-600' : 'text-emerald-600'}>{L('invoicedQty')}: <b>{fmt(docInvoicedQty(d))} / {fmt(docQty(d.lignes))}</b></div> : null}
                  {isReturnDoc(d) ? <div className="text-emerald-700">{L('imputed')}: <b>{dh(d.imputed_amount || 0)}</b></div> : null}
                  {isReturnDoc(d) && Number(d.totalTTC || 0) - Number(d.imputed_amount || 0) > 0.01 ? <div className="text-red-600">{isSales ? L('toRefund') : L('toReceive')}: <b>{dh(Number(d.totalTTC || 0) - Number(d.imputed_amount || 0))}</b></div> : null}
                  {isReturnDoc(d) && d.restocked === false ? <div className="text-slate-400">{L('noRestock')}</div> : null}
                </td>
                <td className="font-mono font-bold">{dh(d.totalTTC)}</td>
                {tab === 'facture' ? <td><Badge tone={tone}>{status}{d.reste > 0 ? ' · ' + L('remaining') + ' ' + dh(d.reste) : ''}</Badge></td> : null}
                <td className="flex gap-1 flex-wrap">
                  {canWriteDoc && !isReturnDoc(d) && d.stage !== 'facture' ? <button onClick={() => advance(d.id)} className="btn bg-slate-800 text-white">{L('advance')}</button> : null}
                  <button onClick={() => setPreview(d)} className="btn bg-white border">{L('preview')}</button>
                  {canPayDoc && paymentButtonVisible(d) ? <button onClick={() => setPay({ ...d, date: today(), mode: 'Espèces', montant: d.reste || d.totalTTC, cashRegister: '', receiptNo: '', chequeNo: '', bank: '', dueDate: '', paymentStatus: 'En portefeuille', transferRef: '', valueDate: '', terminal: '', transactionNo: '', billNo: '', note: '' })} className="btn bg-emerald-600 text-white">{L('pay')}</button> : null}
                  {canWriteDoc && d.stage !== 'facture' && !isReturnDoc(d) && docRemainingQty(d) > 0 ? <button onClick={() => setPartial({ doc: d, date: today(), lignes: docRemainingLines(d).map(l => ({ ...l, qteToProcess: Number(l.remainingQty || 0), excluded: false })) })} className="btn bg-white border">{isSales ? L('partialDelivery') : L('partialReceipt')}</button> : null}
                  {canWriteDoc && canUse(isSales ? 'sales.return' : 'purchases.return') && canReturnDoc(d) ? <button onClick={() => setPartial({ mode: 'return', restock: true, doc: d, date: today(), lignes: docReturnRemainingLines(d).filter(l => Number(l.remainingQty || 0) > 0).map(l => ({ ...l, qteToProcess: 0, excluded: false })) })} className="btn bg-white border">{isSales ? L('creditNote') : L('supplierReturn')}</button> : null}
                  {canWriteDoc && canPartialInvoice(d, type) ? <button onClick={() => setPartial({ mode: 'invoice', doc: d, date: today(), lignes: docInvoiceRemainingLines(d).filter(l => Number(l.remainingQty || 0) > 0).map(l => ({ ...l, qteToProcess: Number(l.remainingQty || 0), excluded: false })) })} className="btn bg-white border">{L('partialInvoice')}</button> : null}
                  {canWriteDoc && !isReturnDoc(d) ? <button onClick={() => setForm({ id: d.id, start: d.stage, date: d.date, partyId: isSales ? d.client_id : d.supplier_id, lignes: (d.lignes || []).map(l => ({ produitId: l.produitId, qte: l.qte, prixUnit: l.prixUnit, remise: l.remise || 0 })) })} className="btn bg-white border">{L('edit')}</button> : null}
                  {canDeleteDoc ? <button onClick={() => remove(d.id)} className="btn bg-red-600 text-white">{L('del')}</button> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {form ? <DocModal L={L} isSales={isSales} form={form} setForm={setForm} products={products} parties={parties} save={save} close={() => setForm(null)} /> : null}
      {pay ? <PaymentModal L={L} isSales={isSales} pay={pay} setPay={setPay} save={settle} close={() => setPay(null)} /> : null}
      {partial ? <PartialModal L={L} isSales={isSales} partial={partial} setPartial={setPartial} save={doPartial} close={() => setPartial(null)} /> : null}
      {preview ? <DocumentPreview L={L} isSales={isSales} doc={preview} close={() => setPreview(null)} /> : null}
    </>
  );
}

function DocModal({ L, isSales, form, setForm, products, parties, save, close }) {
  const currentParty = parties.find(x => String(x.id) === String(form.partyId));
  function defaultPrice(productId, party = currentParty) {
    const p = products.find(x => String(x.id) === String(productId));
    return priceForParty(p, party, isSales);
  }
  function changeParty(partyId) {
    const party = parties.find(x => String(x.id) === String(partyId));
    // Nouveau client : on applique son tarif (détail / gros) aux lignes
    setForm({ ...form, partyId, lignes: (form.lignes || []).map(l => ({ ...l, prixUnit: defaultPrice(l.produitId, party) })) });
  }

  function addLine() {
    const first = products[0];
    setForm({
      ...form,
      lignes: [
        ...form.lignes,
        { produitId: first?.id || '', qte: 1, remise: 0, prixUnit: first ? defaultPrice(first.id) : 0 }
      ]
    });
  }

  function updateLine(i, k, v) {
    setForm({
      ...form,
      lignes: form.lignes.map((l, idx) => {
        if (idx !== i) return l;
        if (k === 'produitId') {
          return { ...l, produitId: v, prixUnit: defaultPrice(v) };
        }
        return { ...l, [k]: v };
      })
    });
  }

  function lineTotal(l) {
    return lineNet({ ...l, prixUnit: l.prixUnit ?? defaultPrice(l.produitId) });
  }

  // Scan code-barres (douchette = clavier + Entrée) ou saisie de la référence
  const [scan, setScan] = useState('');
  function addByCode(code) {
    const c = String(code || '').trim().toLowerCase();
    if (!c) return;
    const p = products.find(x => String(x.barcode || '').toLowerCase() === c) || products.find(x => String(x.ref || '').toLowerCase() === c);
    if (!p) { alert(L('productNotFound') + ' : ' + code); return; }
    const idx = (form.lignes || []).findIndex(l => String(l.produitId) === String(p.id));
    const lignes = idx >= 0
      ? form.lignes.map((l, i) => i === idx ? { ...l, qte: Number(l.qte || 0) + 1 } : l)
      : [...(form.lignes || []).filter(l => l.produitId), { produitId: p.id, qte: 1, remise: 0, prixUnit: defaultPrice(p.id) }];
    setForm({ ...form, lignes });
    setScan('');
  }

  const total = (form.lignes || []).reduce((s, l) => s + lineTotal(l), 0);
  const [tab, setTab] = useState('doc');
  const [catFilter, setCatFilter] = useState('all');
  const attachEnabled = hasModuleAccess('attachments');
  const docCategories = Array.from(new Set(products.map(p => p.categorie).filter(Boolean))).sort();
  const productOptions = (currentId) => products.filter(p => catFilter === 'all' || p.categorie === catFilter || String(p.id) === String(currentId));
  const unitOf = (productId) => products.find(x => String(x.id) === String(productId))?.unite || '';

  return (
    <Modal title={isSales ? L('sales') : L('purchases')} onClose={close} wide>
      {attachEnabled ? (
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('doc')} className={'btn ' + (tab === 'doc' ? 'bg-slate-900 text-white' : 'bg-white border')}>{L('document')}</button>
          <button onClick={() => setTab('attach')} className={'btn ' + (tab === 'attach' ? 'bg-slate-900 text-white' : 'bg-white border')}>{L('attach')}</button>
        </div>
      ) : null}

      {tab === 'attach' && attachEnabled ? (
        form.id
          ? <AttachmentsPanel L={L} entityType={isSales ? 'sale' : 'purchase'} entityId={form.id} branchId={form.branch_id} />
          : <div className="text-sm text-slate-500 p-4 text-center">{L('addAttachment')} — {L('save')} ✓</div>
      ) : (
      <>
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <label className="text-xs text-slate-500">{L('date')}
          <input type="date" className="input mt-1" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </label>
        <label className="text-xs text-slate-500">{isSales ? L('customer') : L('supplier')}
          <select className="input mt-1" value={form.partyId} onChange={e => changeParty(e.target.value)}>
            {parties.map(p => <option key={p.id} value={p.id}>{p.name}{isSales && p.price_tier === 'gros' ? ' (' + L('wholesale') + ')' : ''}</option>)}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <input className="input max-w-sm" placeholder={'🔎 ' + L('scanBarcode')} value={scan} onChange={e => setScan(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addByCode(scan); } }} />
        {currentParty && isSales ? <Badge tone={currentParty.price_tier === 'gros' ? 'amber' : 'slate'}>{currentParty.price_tier === 'gros' ? L('wholesale') : L('retail')}</Badge> : null}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-slate-500">{L('category')}</span>
        <select className="input max-w-xs" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">{L('allCategories')}</option>
          {docCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="table w-full">
          <thead>
            <tr>
              <th>{L('product')}</th>
              <th>{L('quantity')}</th>
              <th>{L('unitPrice')}</th>
              <th>{L('discount')} %</th>
              <th>{L('totalTTC')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {form.lignes.map((l, i) => {
              const price = l.prixUnit ?? defaultPrice(l.produitId);
              return (
                <tr key={i}>
                  <td>
                    <select className="input" value={l.produitId} onChange={e => updateLine(i, 'produitId', e.target.value)}>
                      {productOptions(l.produitId).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nom}{p.nomAr ? ' / ' + p.nomAr : ''} · {L('stock')} {fmt(p.quantite)} {p.unite || ''}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <input className="input" type="number" min="0" step="0.0001" value={l.qte} onChange={e => updateLine(i, 'qte', e.target.value)} />
                      <span className="text-xs text-slate-500 whitespace-nowrap">{unitOf(l.produitId)}</span>
                    </div>
                  </td>
                  <td>
                    <input className="input" type="number" min="0" step="0.01" value={price} readOnly={isSales && !can('sales.price_edit')} title={isSales && !can('sales.price_edit') ? 'sales.price_edit' : ''} onChange={e => updateLine(i, 'prixUnit', e.target.value)} />
                  </td>
                  <td style={{ width: 90 }}>
                    <input className="input" type="number" min="0" max="100" step="0.5" value={l.remise ?? 0} readOnly={isSales && !can('sales.discount')} title={isSales && !can('sales.discount') ? 'sales.discount' : ''} onChange={e => updateLine(i, 'remise', e.target.value)} />
                  </td>
                  <td className="font-bold">{dh(lineTotal({ ...l, prixUnit: price }))}</td>
                  <td>
                    <button className="btn bg-red-50 text-red-600" onClick={() => setForm({ ...form, lignes: form.lignes.filter((_, idx) => idx !== i) })}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button onClick={addLine} className="btn bg-white border">+ Ligne</button>
        <div className="text-right">
          <p className="text-xs text-slate-400">{L('totalTTC')}</p>
          <p className="text-xl font-black">{dh(total)}</p>
        </div>
      </div>

      <button onClick={save} className="btn bg-amber-500 mt-4">{L('save')}</button>
      </>
      )}
    </Modal>
  );
}


/* ===================== Partage PDF (WhatsApp / e-mail) ===================== */
async function elementToPdfBlob(el) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: Math.max(900, el.scrollWidth) });
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageW = 210, pageH = 297, margin = 8;
  const imgW = pageW - margin * 2;
  const pxPerMm = canvas.width / imgW;
  const pageHeightPx = Math.floor((pageH - margin * 2) * pxPerMm);
  let y = 0, first = true;
  while (y < canvas.height) {
    const sliceH = Math.min(pageHeightPx, canvas.height - y);
    const part = document.createElement('canvas');
    part.width = canvas.width; part.height = sliceH;
    part.getContext('2d').drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    if (!first) pdf.addPage();
    pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, imgW, sliceH / pxPerMm);
    first = false; y += sliceH;
  }
  return pdf.output('blob');
}

// 06 12 34 56 78 → 212612345678 (format attendu par WhatsApp)
function whatsappNumber(phone) {
  let d = String(phone || '').replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('00')) d = d.slice(2);
  if (/^0[5-7]\d{8}$/.test(d)) d = '212' + d.slice(1);
  return /^\d{9,15}$/.test(d) ? d : '';
}

function docShareMessage(doc, title, companyName, isSales) {
  const third = isSales ? (doc.client_name || doc.clientName || '') : (doc.supplier_name || doc.supplierName || '');
  const info = paymentInfo(doc);
  const lines = [
    'Bonjour' + (third ? ' ' + third : '') + ',',
    'Veuillez trouver ci-joint ' + title + ' N° ' + docNo(doc) + ' du ' + (doc.date || today()) + ', d\'un montant de ' + dh(doc.totalTTC || doc.total_ttc || 0) + '.'
  ];
  if (doc.stage === 'facture' && Number(info.rest || 0) > 0.009) lines.push('Reste à régler : ' + dh(info.rest) + '.');
  lines.push('Cordialement,', companyName || 'DrogueriePro');
  return lines.join('\n');
}

function DocumentPreview({ L, type, doc, close }) {
  const isSales = type === 'sales' || doc?.client_id || doc?.client_name;
  const [company, setCompany] = useState(null);
  useEffect(() => { loadCompanySettings().then(setCompany).catch(() => setCompany({ name: 'DrogueriePro' })); }, []);

  const c = company || { name: 'DrogueriePro' };
  const third = isSales ? (doc.client_name || doc.clientName || '-') : (doc.supplier_name || doc.supplierName || '-');
  const docTitle = preciseDocTitle(doc, type, L);
  const vatRate = Number(doc.vat_rate || 20);
  const areaRef = useRef(null);
  const [contact, setContact] = useState({ phone: '' });
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    const id = isSales ? doc.client_id : doc.supplier_id;
    if (!id) return;
    supabase.from(isSales ? 'clients' : 'suppliers').select('phone').eq('id', id).maybeSingle().then(({ data }) => setContact({ phone: data?.phone || '' }));
  }, [doc?.id]);
  const fileName = (docNo(doc) || 'document').replace(/[^\w.-]+/g, '_') + '.pdf';

  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
  async function share(channel) {
    if (!areaRef.current) return;
    setSharing(true);
    try {
      const blob = await elementToPdfBlob(areaRef.current);
      const msg = docShareMessage(doc, docTitle, c.name, isSales);
      const file = typeof File !== 'undefined' ? new File([blob], fileName, { type: 'application/pdf' }) : null;
      if (channel === 'pdf') {
        downloadBlob(blob);
      } else if (channel === 'native' && file && navigator.canShare && navigator.canShare({ files: [file] })) {
        // Téléphone : la feuille de partage propose WhatsApp, Gmail… avec le PDF joint
        await navigator.share({ files: [file], title: docTitle + ' ' + docNo(doc), text: msg }).catch(() => {});
      } else if (channel === 'email') {
        downloadBlob(blob);
        window.location.href = 'mailto:?subject=' + encodeURIComponent(docTitle + ' ' + docNo(doc) + ' — ' + (c.name || '')) + '&body=' + encodeURIComponent(msg);
      } else {
        // Ordinateur : le PDF est téléchargé et WhatsApp s'ouvre avec le message prêt (il reste à joindre le PDF)
        downloadBlob(blob);
        window.open('https://wa.me/' + whatsappNumber(contact.phone) + '?text=' + encodeURIComponent(msg), '_blank');
      }
      auditLog(isSales ? 'Ventes' : 'Achats', 'SHARE', docNo(doc), 'Partage ' + channel);
    } catch (e) { alert(e.message); }
    setSharing(false);
  }
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;

  return (
    <Modal title={L('preview')} onClose={close} wide>
      <div className="print-area simple-document" ref={areaRef}>
        <div className="simple-doc-header">
          <div>
            <div className="simple-brand">{c.name}</div>
            <div className="simple-muted">{c.address || '-'}</div>
            <div className="simple-muted">{L('phone')} : {c.phone || '-'}</div>
            <div className="simple-legal">ICE: {c.ice || '-'} · RC: {c.rc || '-'} · IF: {c.ifNumber || '-'} · Patente: {c.patente || '-'}</div>
          </div>

          <div className="simple-title-box">
            <div className="simple-title">{docTitle}</div>
            <div className="simple-number">{docNo(doc)}</div>
            <div className="simple-muted">{L('date')} : {doc.date || today()}</div>
          </div>
        </div>

        <div className="simple-doc-meta">
          <div>
            <span>{isSales ? L('customer') : L('supplier')}</span>
            <b>{third}</b>
          </div>
          <div>
            <span>{L('payment')}</span>
            <b>{paymentLabel(doc, L)}</b>
          </div>
          <div>
            <span>{L('createdBy')}</span>
            <b>{doc.createdByLabel || currentUserLabel() || '-'}</b>
          </div>
          <div>
            <span>{L('baseDocNo')}</span>
            <b>{doc.baseDocId ? (doc.baseDocNumber || ('#' + doc.baseDocId)) : '-'}</b>
          </div>
        </div>

        <table className="simple-lines">
          <thead>
            <tr>
              <th>#</th>
              <th>{L('ref')}</th>
              <th>{L('product')}</th>
              <th>{L('quantity')}</th>
              <th>{L('unitPrice')}</th>
              {(doc.lignes || []).some(l => lineDiscount(l) > 0) ? <th>{L('discount')}</th> : null}
              <th>{L('totalTTC')}</th>
            </tr>
          </thead>
          <tbody>
            {(doc.lignes || []).map((l, i) => {
              const total = lineNet(l);
              const hasDiscount = (doc.lignes || []).some(x => lineDiscount(x) > 0);
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="font-mono">{l.ref || l.produitId || '-'}</td>
                  <td>{l.nom || '-'}</td>
                  <td>{fmt(l.qte)} {l.unite || ''}</td>
                  <td>{dh(l.prixUnit)}</td>
                  {hasDiscount ? <td>{lineDiscount(l) ? fmt(lineDiscount(l)) + ' %' : '-'}</td> : null}
                  <td className="simple-bold">{dh(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="simple-bottom">
          <div className="simple-note">
            <b>{L('note')}</b>
            <p>{L('legalMoroccoNote') || L('legalNote')}</p>
            <p>{L('thankYou') || ''}</p>
          </div>

          <div className="simple-totals">
            <div><span>{L('totalHT')}</span><b>{dh(doc.totalHT || 0)}</b></div>
            <div><span>{L('totalVAT')} ({fmt(vatRate)}%)</span><b>{dh(doc.tva || 0)}</b></div>
            <div className="simple-grand"><span>{L('netToPay')}</span><b>{dh(doc.totalTTC || 0)}</b></div>
          </div>
        </div>

        <div className="simple-footer">
          <div>{L('printDate')} : {new Date().toLocaleString()}</div>
          <div className="simple-signature">{L('signature')}</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 mt-4 no-print">
        {sharing ? <span className="text-sm text-slate-500 self-center">{L('pdfBuilding')}</span> : null}
        {canNativeShare && featureOn('share') ? <button disabled={sharing} onClick={() => share('native')} className="btn bg-amber-500">📤 {L('share')}</button> : null}
        {featureOn('share') ? <button disabled={sharing} onClick={() => share('whatsapp')} className="btn bg-green-600 text-white" title={contact.phone || ''}>WhatsApp</button> : null}
        {featureOn('share') ? <button disabled={sharing} onClick={() => share('email')} className="btn bg-white border">✉ {L('email')}</button> : null}
        <button disabled={sharing} onClick={() => share('pdf')} className="btn bg-white border">📄 PDF</button>
        <button onClick={() => window.print()} className="btn bg-slate-900 text-white">{L('print')}</button>
        <button onClick={close} className="btn bg-white border">{L('closeBtn')}</button>
      </div>
    </Modal>
  );
}

function Payments({ L }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');
  const [attach, setAttach] = useState(null);
  const [closure, setClosure] = useState(false);
  const attachEnabled = hasModuleAccess('attachments');

  async function load() {
    try {
      setErr('');
      const data = await loadPayments();
      setRows(data || []);
    } catch (e) {
      console.warn('Payments load error:', e.message);
      setRows([]);
      setErr('');
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'active') return !p.canceled;
    if (filter === 'canceled') return !!p.canceled;
    return p.type === filter;
  });

  async function cancel(p) {
    if (!can('payments.cancel')) return alert('Autorisation insuffisante : payments.cancel');
    const reason = prompt('Motif annulation ?', 'Annulation règlement');
    if (reason === null) return;
    try {
      await cancelPayment(p.sourceTable, p.docId, p.id, reason);
      await load();
    } catch (e) { alert(e.message); }
  }

  const activeTotal = filtered.filter(p => !p.canceled).reduce((s, p) => s + Number(p.montant || 0), 0);
  const canceledTotal = filtered.filter(p => p.canceled).reduce((s, p) => s + Number(p.montant || 0), 0);

  return (
    <>
      <Header title={L('payments')}>
        <select className="input max-w-xs" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">{L('all')}</option>
          <option value="active">Actifs</option>
          <option value="canceled">{L('canceled')}</option>
          <option value="encaissement">{L('cashIn')}</option>
          <option value="decaissement">{L('cashOut')}</option>
        </select>
        <button onClick={load} className="btn bg-white border">↻</button>
        {canUse('cash.close') ? <button onClick={() => setClosure(true)} className="btn bg-amber-500">🧾 {L('cashClosure')}</button> : null}
      </Header>

      <div className="pro-kpi-grid mb-4">
        <div className="pro-kpi-card"><span>{L('kpiCashIn')}</span><b>{dh(rows.filter(p => p.type === 'encaissement' && !p.canceled && p.mode !== 'Avoir').reduce((s,p)=>s+Number(p.montant||0),0))}</b><small>{L('cashIn')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiCashOut')}</span><b>{dh(rows.filter(p => p.type === 'decaissement' && !p.canceled && p.mode !== 'Avoir').reduce((s,p)=>s+Number(p.montant||0),0))}</b><small>{L('cashOut')}</small></div>
        <div className="pro-kpi-card"><span>{L('paymentList')}</span><b>{filtered.length}</b><small>{L('document')}</small></div>
        <div className="pro-kpi-card"><span>{L('canceled')}</span><b>{dh(canceledTotal)}</b><small>{L('cancelPayment')}</small></div>
      </div>

      {err ? <ErrorBox msg={err} /> : null}

      <Table>
        <thead>
          <tr>
            <th>{L('date')}</th>
            <th>Type</th>
            <th>{L('docType')}</th>
            <th>{L('document')}</th>
            <th>{L('customer')} / {L('supplier')}</th>
            <th>{L('createdBy')}</th>
            <th>Mode</th>
            <th>{L('detail')}</th>
            <th>{L('totalTTC')}</th>
            <th>{L('paymentStatus')}</th>
            <th>{L('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={(p.docId || '') + '-' + (p.id || i)} className={p.canceled ? 'payment-canceled' : ''}>
              <td>{p.date || '-'}</td>
              <td><Badge tone={p.type === 'encaissement' ? 'green' : 'amber'}>{p.type === 'encaissement' ? L('cashIn') : L('cashOut')}</Badge></td>
              <td>{p.docType || '-'}</td>
              <td className="font-mono text-xs">{p.docNumber || '-'}</td>
              <td>{p.tiers || '-'}</td>
              <td><Badge tone="blue">{p.createdByLabel || '-'}</Badge></td>
              <td>{p.mode || '-'}</td>
              <td className="text-xs text-slate-500">{[p.chequeNo, p.bank, p.transferRef, p.transactionNo, p.note].filter(Boolean).join(' · ') || '-'}</td>
              <td className="font-bold">{dh(p.montant || 0)}</td>
              <td>{p.canceled ? <Badge tone="red">{L('canceled')}</Badge> : <Badge tone="green">Actif</Badge>}</td>
              <td className="flex gap-1 flex-wrap">
                {attachEnabled ? <button onClick={() => setAttach(p)} className="btn bg-white border" title={L('attach')}>📎</button> : null}
                {!p.canceled && p.mode !== 'Avoir' ? <button onClick={() => cancel(p)} className="btn bg-red-600 text-white">{L('cancelPayment')}</button> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {attach ? (
        <Modal title={L('attach') + ' — ' + (attach.docNumber || '') + ' · ' + dh(attach.montant || 0)} onClose={() => setAttach(null)}>
          <div className="text-sm text-slate-500 mb-2">{attach.date} · {attach.mode} · {attach.tiers || '-'}</div>
          <AttachmentsPanel L={L} entityType="payment" entityId={paymentAttachmentId(attach)} />
        </Modal>
      ) : null}
      {closure ? <CashClosureModal L={L} payments={rows} close={() => setClosure(false)} /> : null}
    </>
  );
}

function paymentAttachmentId(p) {
  return String(p.sourceTable || '') + '-' + String(p.docId || '') + '-' + String(p.id || '');
}


function PaymentModal({ L, isSales, pay, setPay, save, close }) {
  const mode = pay.mode || 'Espèces';
  function Field({ label, name, type = 'text' }) {
    return <label className="text-xs text-slate-500">{label}<input type={type} className="input mt-1 mb-2" value={pay[name] || ''} onChange={e => setPay({ ...pay, [name]: e.target.value })} /></label>;
  }
  function SelectField({ label, name, options }) {
    return <label className="text-xs text-slate-500">{label}<select className="input mt-1 mb-2" value={pay[name] || ''} onChange={e => setPay({ ...pay, [name]: e.target.value })}>{options.map(x => <option key={x} value={x}>{x}</option>)}</select></label>;
  }
  return (
    <Modal title={isSales ? L('cashIn') : L('cashOut')} onClose={close}>
      <p className="text-sm mb-2">{L('remaining')} : <b>{dh(pay.reste || 0)}</b></p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label={L('date')} name="date" type="date" />
        <label className="text-xs text-slate-500">Mode<select className="input mt-1 mb-2" value={mode} onChange={e => setPay({ ...pay, mode: e.target.value })}>{['Espèces', 'Chèque', 'Virement', 'Carte', 'Effet', 'Crédit'].map(x => <option key={x}>{x}</option>)}</select></label>
        <Field label="Montant" name="montant" type="number" />
        {mode === 'Espèces' && <><Field label={L('cashRegister')} name="cashRegister" /><Field label={L('receiptNo')} name="receiptNo" /></>}
        {mode === 'Chèque' && <><Field label={L('chequeNo')} name="chequeNo" /><Field label={L('bank')} name="bank" /><Field label={L('dueDate')} name="dueDate" type="date" /><SelectField label={L('paymentStatus')} name="paymentStatus" options={['En portefeuille','Déposé','Encaissé','Rejeté']} /></>}
        {mode === 'Virement' && <><Field label={L('bank')} name="bank" /><Field label={L('transferRef')} name="transferRef" /><Field label={L('valueDate')} name="valueDate" type="date" /></>}
        {mode === 'Carte' && <><Field label={L('terminal')} name="terminal" /><Field label={L('transactionNo')} name="transactionNo" /></>}
        {mode === 'Effet' && <><Field label={L('billNo')} name="billNo" /><Field label={L('bank')} name="bank" /><Field label={L('dueDate')} name="dueDate" type="date" /><SelectField label={L('paymentStatus')} name="paymentStatus" options={['En portefeuille','Déposé','Encaissé','Rejeté']} /></>}
        {mode === 'Crédit' && <><Field label={L('dueDate')} name="dueDate" type="date" /><Field label={L('note')} name="note" /></>}
      </div>
      <label className="text-xs text-slate-500">{L('note')}<textarea className="input mt-1" value={pay.note || ''} onChange={e => setPay({ ...pay, note: e.target.value })} /></label>
      <button onClick={save} className="btn bg-emerald-600 text-white mt-4">{L('save')}</button>
    </Modal>
  );
}

function PartialModal({ L, isSales, partial, setPartial, save, close }) {
  const lines = partial.lignes || [];

  function updateLine(index, value) {
    const next = [...lines];
    const max = Number(next[index].remainingQty || 0);
    let qty = Number(value || 0);
    if (qty < 0) qty = 0;
    if (qty > max) qty = max;
    next[index] = { ...next[index], qteToProcess: qty, excluded: false };
    setPartial({ ...partial, lignes: next });
  }

  function toggleExclude(index) {
    const next = [...lines];
    const current = next[index];
    const excluded = !current.excluded;
    next[index] = {
      ...current,
      excluded,
      qteToProcess: excluded ? 0 : Number(current.remainingQty || 0)
    };
    setPartial({ ...partial, lignes: next });
  }

  function removeZeroLines() {
    const next = lines.map(l => Number(l.qteToProcess || 0) <= 0 ? { ...l, excluded: true, qteToProcess: 0 } : l);
    setPartial({ ...partial, lignes: next });
  }

  function restoreAll() {
    const next = lines.map(l => ({ ...l, excluded: false, qteToProcess: Number(l.remainingQty || 0) }));
    setPartial({ ...partial, lignes: next });
  }

  const includedLines = lines.filter(l => !l.excluded);
  const totalToProcess = includedLines.reduce((s, l) => s + Number(l.qteToProcess || 0), 0);

  return (
    <Modal title={partial.mode === 'invoice' ? L('partialInvoice') + ' — ' + docNo(partial.doc) : partial.mode === 'return' ? (isSales ? L('creditNote') : L('supplierReturn')) + ' — ' + docNo(partial.doc) : (isSales ? L('partialDelivery') : L('partialReceipt'))} onClose={close} wide>
      {partial.mode === 'return' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-sm">
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={partial.restock !== false} onChange={e => setPartial({ ...partial, restock: e.target.checked })} />
            {isSales ? L('restockClient') : L('restockSupplier')}
          </label>
          <p className="text-xs text-slate-500 mt-1">{L('returnHint')}</p>
        </div>
      ) : null}
      <label className="text-xs text-slate-500">{L('date')}
        <input className="input mt-1 mb-3" type="date" value={partial.date || today()} onChange={e => setPartial({ ...partial, date: e.target.value })} />
      </label>

      <div className="flex gap-2 flex-wrap mb-3">
        <button onClick={restoreAll} className="btn bg-white border">{L('restoreLine')}</button>
        <button onClick={removeZeroLines} className="btn bg-white border">{L('removeLine')} qté 0</button>
      </div>

      <div className="card overflow-auto mb-4">
        <table className="table w-full">
          <thead>
            <tr>
              <th>{L('includeLine')}</th>
              <th>{L('ref')}</th>
              <th>{L('product')}</th>
              <th>{L('orderedQty')}</th>
              <th>{L('alreadyProcessed')}</th>
              <th>{L('remainingQty')}</th>
              <th>{L('qtyToProcess')}</th>
              <th>{L('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={lineKey(l) || i} className={l.excluded ? 'partial-line-excluded' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={!l.excluded}
                    onChange={() => toggleExclude(i)}
                  />
                </td>
                <td className="font-mono text-xs">{l.ref || '-'}</td>
                <td>
                  <div className="font-semibold">{l.nom || '-'}</div>
                  {l.excluded ? <div className="text-xs text-red-500">{L('removeLine')}</div> : null}
                </td>
                <td>{fmt(l.qte)}</td>
                <td>{fmt(l.processedQty || 0)}</td>
                <td className="font-bold">{fmt(l.remainingQty || 0)}</td>
                <td>
                  <input
                    className="input max-w-xs"
                    type="number"
                    min="0"
                    max={Number(l.remainingQty || 0)}
                    step="0.01"
                    disabled={!!l.excluded}
                    value={l.qteToProcess ?? 0}
                    onChange={e => updateLine(i, e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => toggleExclude(i)} className={l.excluded ? 'btn bg-emerald-600 text-white' : 'btn bg-red-600 text-white'}>
                    {l.excluded ? L('restoreLine') : L('removeLine')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">
          {L('qtyToProcess')} : <b>{fmt(totalToProcess)}</b> · {L('includeLine')} : <b>{includedLines.length}</b> / {lines.length}
        </div>
        <button disabled={totalToProcess <= 0} onClick={save} className="btn bg-amber-500 disabled:opacity-50">{L('save')}</button>
      </div>
    </Modal>
  );
}

const EXPENSE_CATS = ['Transport', 'Carburant', 'Nourriture', 'Personnel', 'Péage', 'Hébergement', 'Entretien', 'Autre'];

function expenseBranchId() {
  return selectedBranchId() || currentBranchId() || null;
}

// Admin/Gérant gèrent tout ; chaque autre utilisateur gère uniquement ses propres déplacements/charges.
function expensesSeeAll(session = getStoredSession()) {
  return isAdmin(session) || isSuperAdmin(session) || isManager(session);
}
function canExpenses() {
  // V49 : saisie de SES déplacements et charges selon le droit expenses.write
  return canUse('expenses.write');
}
function ownsRow(row, session = getStoredSession()) {
  return String(row?.created_by || '') === String(session?.user?.id || '');
}
function canEditExpenseRow(row, session = getStoredSession()) {
  return expensesSeeAll(session) || ownsRow(row, session);
}

async function loadTrips() {
  const session = getStoredSession();
  let q = supabase.from('trips').select('*').order('date', { ascending: false }).order('id', { ascending: false });
  if (isAdmin(session) || isSuperAdmin(session)) q = applyBranchFilterToQuery(q, session);
  else if (isManager(session)) { if (branchId(session)) q = q.eq('branch_id', branchId(session)); }
  else q = q.eq('created_by', String(session?.user?.id || ''));
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}

async function loadExpenses() {
  const session = getStoredSession();
  let q = supabase.from('expenses').select('*').order('date', { ascending: false }).order('id', { ascending: false });
  if (isAdmin(session) || isSuperAdmin(session)) q = applyBranchFilterToQuery(q, session);
  else if (isManager(session)) { if (branchId(session)) q = q.eq('branch_id', branchId(session)); }
  else q = q.eq('created_by', String(session?.user?.id || ''));
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}

async function loadTripSales() {
  const session = getStoredSession();
  let q = supabase.from('sales').select('*');
  q = applyDocScope(q, 'sales', session);
  const { data, error } = await q.order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapDoc);
}

async function saveTrip(t) {
  if (!canExpenses()) throw new Error('Action non autorisée');
  const payload = {
    num_dep: t.num_dep || ('DEP-' + Date.now().toString().slice(-6)),
    date: t.date || today(),
    label: t.label || '',
    destination: t.destination || '',
    manager: t.manager || '',
    vehicle: t.vehicle || '',
    status: t.status || 'ouvert',
    note: t.note || '',
    branch_id: t.branch_id || expenseBranchId()
  };
  if (t.id) {
    const { error } = await supabase.from('trips').update(payload).eq('id', t.id);
    if (error) throw new Error(error.message);
  } else {
    payload.created_by = String(getStoredSession()?.user?.id || '');
    const { error } = await supabase.from('trips').insert(payload);
    if (error) throw new Error(error.message);
  }
}

async function deleteTrip(id) {
  if (!canExpenses()) throw new Error('Action non autorisée');
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

async function saveExpense(x) {
  if (!canExpenses()) throw new Error('Action non autorisée');
  const payload = {
    num_chg: x.num_chg || ('CHG-' + Date.now().toString().slice(-6)),
    date: x.date || today(),
    category: x.category || 'Autre',
    label: x.label || '',
    amount: Number(x.amount || 0),
    trip_id: x.trip_id || null,
    beneficiary: x.beneficiary || '',
    mode: x.mode || '',
    branch_id: x.branch_id || expenseBranchId()
  };
  if (x.id) {
    const { error } = await supabase.from('expenses').update(payload).eq('id', x.id);
    if (error) throw new Error(error.message);
  } else {
    payload.created_by = String(getStoredSession()?.user?.id || '');
    const { error } = await supabase.from('expenses').insert(payload);
    if (error) throw new Error(error.message);
  }
}

async function deleteExpense(id) {
  if (!canExpenses()) throw new Error('Action non autorisée');
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

async function setSaleTrip(saleId, tripId) {
  if (!canExpenses()) throw new Error('Action non autorisée');
  const { error } = await supabase.from('sales').update({ trip_id: tripId }).eq('id', saleId);
  if (error) throw new Error(error.message);
}

function AttachmentsPanel({ L, entityType, entityId, branchId: bId }) {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const enabled = hasModuleAccess('attachments');

  async function load() {
    if (!entityId) { setRows([]); return; }
    try {
      const { data, error } = await supabase.from('attachments')
        .select('*').eq('entity_type', entityType).eq('entity_id', String(entityId))
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRows(data || []);
    } catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); }, [entityType, entityId]);

  async function upload(file) {
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const safe = file.name.replace(/[^\w.\-]+/g, '_');
      const path = entityType + '/' + entityId + '/' + Date.now() + '_' + safe;
      const up = await supabase.storage.from('attachments').upload(path, file, { upsert: false });
      if (up.error) throw up.error;
      const ins = await supabase.from('attachments').insert({
        entity_type: entityType, entity_id: String(entityId), file_name: file.name,
        storage_path: path, mime: file.type, size: file.size,
        branch_id: bId || currentBranchId() || null,
        uploaded_by: String(getStoredSession()?.user?.id || '')
      });
      if (ins.error) throw ins.error;
      await load();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  async function openFile(row) {
    try {
      const { data, error } = await supabase.storage.from('attachments').createSignedUrl(row.storage_path, 3600);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (e) { alert(e.message); }
  }

  async function remove(row) {
    if (!confirm('Supprimer ?')) return;
    try {
      await supabase.storage.from('attachments').remove([row.storage_path]);
      const { error } = await supabase.from('attachments').delete().eq('id', row.id);
      if (error) throw error;
      await load();
    } catch (e) { alert(e.message); }
  }

  if (!enabled) return null;
  if (!entityId) return <div className="text-xs text-slate-400 mt-3 border-t pt-2">{L('attach')} — {L('save')}…</div>;

  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-600">{L('attach')}</span>
        <label className="btn bg-white border text-xs" style={{ cursor: 'pointer' }}>
          {busy ? '…' : L('addAttachment')}
          <input type="file" style={{ display: 'none' }} disabled={busy} onChange={e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; upload(f); }} />
        </label>
      </div>
      {err ? <div className="text-xs text-red-600 mb-1">{err}</div> : null}
      {rows.length ? (
        <ul className="space-y-1">
          {rows.map(r => (
            <li key={r.id} className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1">
              <button onClick={() => openFile(r)} className="text-blue-600 underline truncate text-left" style={{ maxWidth: '70%' }}>{r.file_name || r.storage_path}</button>
              <button onClick={() => remove(r)} className="text-red-600">✕</button>
            </li>
          ))}
        </ul>
      ) : <div className="text-xs text-slate-400">{L('noAttachment')}</div>}
    </div>
  );
}

function ExpensesCenter({ L }) {
  const [tab, setTab] = useState('trips');
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [tripForm, setTripForm] = useState(null);
  const [expForm, setExpForm] = useState(null);
  const [detail, setDetail] = useState(null);
  const [err, setErr] = useState('');
  const writable = canExpenses();

  async function load() {
    try {
      setErr('');
      const [t, x, s] = await Promise.all([loadTrips(), loadExpenses(), loadTripSales()]);
      setTrips(t); setExpenses(x); setSales(s);
    } catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  function tripStats(tripId) {
    const grossMargin = sales
      .filter(d => String(d.trip_id || '') === String(tripId) && d.stage === 'facture')
      .reduce((s, d) => s + documentProfit(d).margin, 0);
    const linkedSalesCount = sales.filter(d => String(d.trip_id || '') === String(tripId)).length;
    const totalCharges = expenses
      .filter(e => String(e.trip_id || '') === String(tripId))
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    return { grossMargin, totalCharges, net: grossMargin - totalCharges, linkedSalesCount };
  }

  async function saveTripForm() {
    try { await saveTrip(tripForm); setTripForm(null); await load(); } catch (e) { alert(e.message); }
  }
  async function removeTrip(id) {
    if (!confirm('Supprimer ?')) return;
    try { await deleteTrip(id); await load(); } catch (e) { alert(e.message); }
  }
  async function saveExpForm() {
    try { await saveExpense(expForm); setExpForm(null); await load(); } catch (e) { alert(e.message); }
  }
  async function removeExpense(id) {
    if (!confirm('Supprimer ?')) return;
    try { await deleteExpense(id); await load(); } catch (e) { alert(e.message); }
  }
  async function toggleSaleTrip(saleId, tripId) {
    try { await setSaleTrip(saleId, tripId); await load(); } catch (e) { alert(e.message); }
  }

  if (err) return <ErrorBox msg={err} />;

  const totalChargesAll = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const unassignedCharges = expenses.filter(e => !e.trip_id);

  return (
    <>
      <Header title={L('expensesMod')}>
        <button onClick={load} className="btn bg-white border">↻</button>
        {writable && tab === 'trips' ? <button onClick={() => setTripForm({ date: today(), status: 'ouvert', branch_id: expenseBranchId() })} className="btn bg-amber-500">{L('addTrip')}</button> : null}
        {writable && tab === 'charges' ? <button onClick={() => setExpForm({ date: today(), category: 'Transport', branch_id: expenseBranchId() })} className="btn bg-amber-500">{L('addExpense')}</button> : null}
      </Header>

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <div className="card p-4"><p className="text-xs text-slate-400">{L('trips')}</p><p className="text-2xl font-black">{trips.length}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('charges')}</p><p className="text-2xl font-black">{expenses.length}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('totalCharges')}</p><p className="text-2xl font-black">{dh(totalChargesAll)}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('noTrip')}</p><p className="text-2xl font-black">{unassignedCharges.length}</p></div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('trips')} className={'btn ' + (tab === 'trips' ? 'bg-slate-900 text-white' : 'bg-white border')}>{L('trips')}</button>
        <button onClick={() => setTab('charges')} className={'btn ' + (tab === 'charges' ? 'bg-slate-900 text-white' : 'bg-white border')}>{L('charges')}</button>
      </div>

      {tab === 'trips' ? (
        <Table>
          <thead>
            <tr>
              <th>{L('tripNum')}</th><th>{L('date')}</th><th>{L('tripLabel')}</th><th>{L('destination')}</th>
              <th>{L('vehicle')}</th><th>{L('grossMarginLbl')}</th><th>{L('totalCharges')}</th><th>{L('netMargin')}</th><th>{L('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(t => {
              const st = tripStats(t.id);
              return (
                <tr key={t.id}>
                  <td className="font-mono text-xs">{t.num_dep}</td>
                  <td>{t.date}</td>
                  <td className="font-semibold">{t.label || '-'}</td>
                  <td>{t.destination || '-'}</td>
                  <td>{t.vehicle || '-'}</td>
                  <td>{dh(st.grossMargin)}</td>
                  <td className="text-red-600">{dh(st.totalCharges)}</td>
                  <td className={st.net >= 0 ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>{dh(st.net)}</td>
                  <td className="flex gap-1 flex-wrap">
                    <button onClick={() => setDetail(t)} className="btn bg-white border">{L('tripDetail')}</button>
                    {canEditExpenseRow(t) ? <button onClick={() => setTripForm(t)} className="btn bg-white border">{L('edit')}</button> : null}
                    {canEditExpenseRow(t) ? <button onClick={() => removeTrip(t.id)} className="btn bg-red-600 text-white">{L('del')}</button> : null}
                  </td>
                </tr>
              );
            })}
            {!trips.length ? <tr><td colSpan="9">{L('noData')}</td></tr> : null}
          </tbody>
        </Table>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>{L('chargeNum')}</th><th>{L('date')}</th><th>{L('chargeCat')}</th><th>{L('tripLabel')}</th>
              <th>{L('beneficiary')}</th><th>{L('trip')}</th><th>{L('amount')}</th><th>{L('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td className="font-mono text-xs">{e.num_chg}</td>
                <td>{e.date}</td>
                <td><Badge tone="amber">{e.category}</Badge></td>
                <td>{e.label || '-'}</td>
                <td>{e.beneficiary || '-'}</td>
                <td className="text-xs">{trips.find(t => String(t.id) === String(e.trip_id))?.num_dep || L('noTrip')}</td>
                <td className="font-semibold">{dh(e.amount)}</td>
                <td className="flex gap-1 flex-wrap">
                  {canEditExpenseRow(e) ? <button onClick={() => setExpForm(e)} className="btn bg-white border">{L('edit')}</button> : null}
                  {canEditExpenseRow(e) ? <button onClick={() => removeExpense(e.id)} className="btn bg-red-600 text-white">{L('del')}</button> : null}
                </td>
              </tr>
            ))}
            {!expenses.length ? <tr><td colSpan="8">{L('noData')}</td></tr> : null}
          </tbody>
        </Table>
      )}

      {tripForm ? (
        <Modal title={L('trip')} onClose={() => setTripForm(null)}>
          <label className="text-xs text-slate-500">{L('date')}<input type="date" className="input mt-1 mb-2" value={tripForm.date || ''} onChange={e => setTripForm({ ...tripForm, date: e.target.value })} /></label>
          <input className="input mb-2" placeholder={L('tripLabel')} value={tripForm.label || ''} onChange={e => setTripForm({ ...tripForm, label: e.target.value })} />
          <input className="input mb-2" placeholder={L('destination')} value={tripForm.destination || ''} onChange={e => setTripForm({ ...tripForm, destination: e.target.value })} />
          <input className="input mb-2" placeholder={L('manager2')} value={tripForm.manager || ''} onChange={e => setTripForm({ ...tripForm, manager: e.target.value })} />
          <input className="input mb-2" placeholder={L('vehicle')} value={tripForm.vehicle || ''} onChange={e => setTripForm({ ...tripForm, vehicle: e.target.value })} />
          <label className="text-xs text-slate-500">{L('statusLbl')}<select className="input mt-1 mb-2" value={tripForm.status || 'ouvert'} onChange={e => setTripForm({ ...tripForm, status: e.target.value })}><option value="ouvert">ouvert</option><option value="clôturé">clôturé</option></select></label>
          <textarea className="input mb-2" placeholder={L('note')} value={tripForm.note || ''} onChange={e => setTripForm({ ...tripForm, note: e.target.value })} />
          {tripForm.id ? <AttachmentsPanel L={L} entityType="trip" entityId={tripForm.id} branchId={tripForm.branch_id} /> : null}
          <button onClick={saveTripForm} className="btn bg-amber-500 mt-2">{L('save')}</button>
        </Modal>
      ) : null}

      {expForm ? (
        <Modal title={L('expense')} onClose={() => setExpForm(null)}>
          <label className="text-xs text-slate-500">{L('date')}<input type="date" className="input mt-1 mb-2" value={expForm.date || ''} onChange={e => setExpForm({ ...expForm, date: e.target.value })} /></label>
          <label className="text-xs text-slate-500">{L('chargeCat')}<select className="input mt-1 mb-2" value={expForm.category || 'Transport'} onChange={e => setExpForm({ ...expForm, category: e.target.value })}>{EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
          <input className="input mb-2" placeholder={L('tripLabel')} value={expForm.label || ''} onChange={e => setExpForm({ ...expForm, label: e.target.value })} />
          <input className="input mb-2" placeholder={L('beneficiary')} value={expForm.beneficiary || ''} onChange={e => setExpForm({ ...expForm, beneficiary: e.target.value })} />
          <input type="number" className="input mb-2" placeholder={L('amount')} value={expForm.amount || ''} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} />
          <label className="text-xs text-slate-500">{L('trip')}<select className="input mt-1 mb-2" value={expForm.trip_id || ''} onChange={e => setExpForm({ ...expForm, trip_id: e.target.value ? Number(e.target.value) : null })}><option value="">{L('noTrip')}</option>{trips.map(t => <option key={t.id} value={t.id}>{t.num_dep + ' — ' + (t.label || t.destination || '')}</option>)}</select></label>
          {expForm.id ? <AttachmentsPanel L={L} entityType="expense" entityId={expForm.id} branchId={expForm.branch_id} /> : null}
          <button onClick={saveExpForm} className="btn bg-amber-500 mt-2">{L('save')}</button>
        </Modal>
      ) : null}

      {detail ? (() => {
        const st = tripStats(detail.id);
        const linked = sales.filter(d => String(d.trip_id || '') === String(detail.id));
        const linkable = sales.filter(d => !d.trip_id && d.stage === 'facture');
        const tripCharges = expenses.filter(e => String(e.trip_id || '') === String(detail.id));
        return (
          <Modal title={L('tripDetail') + ' — ' + detail.num_dep} onClose={() => setDetail(null)} wide>
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div className="card p-3"><p className="text-xs text-slate-400">{L('grossMarginLbl')}</p><p className="text-xl font-black">{dh(st.grossMargin)}</p></div>
              <div className="card p-3"><p className="text-xs text-slate-400">{L('totalCharges')}</p><p className="text-xl font-black text-red-600">{dh(st.totalCharges)}</p></div>
              <div className="card p-3"><p className="text-xs text-slate-400">{L('netMargin')}</p><p className={'text-xl font-black ' + (st.net >= 0 ? 'text-emerald-700' : 'text-red-700')}>{dh(st.net)}</p></div>
            </div>

            <h3 className="font-bold text-sm mb-2">{L('linkedSales')}</h3>
            <Table>
              <thead><tr><th>{L('date')}</th><th>Réf</th><th>{L('amount')}</th><th>{L('grossMarginLbl')}</th><th>{L('actions')}</th></tr></thead>
              <tbody>
                {linked.map(d => (
                  <tr key={d.id}>
                    <td>{d.date}</td><td className="font-mono text-xs">{d.ref || d.id}</td>
                    <td>{dh(d.totalTTC)}</td><td>{dh(documentProfit(d).margin)}</td>
                    <td>{canEditExpenseRow(detail) ? <button onClick={() => toggleSaleTrip(d.id, null)} className="btn bg-white border">{L('unlink')}</button> : null}</td>
                  </tr>
                ))}
                {!linked.length ? <tr><td colSpan="5">{L('noData')}</td></tr> : null}
              </tbody>
            </Table>

            {canEditExpenseRow(detail) ? (
              <div className="mt-3">
                <label className="text-xs text-slate-500">{L('linkTo')}
                  <select className="input mt-1" value="" onChange={e => { if (e.target.value) toggleSaleTrip(Number(e.target.value), detail.id); }}>
                    <option value="">--</option>
                    {linkable.map(d => <option key={d.id} value={d.id}>{(d.ref || d.id) + ' — ' + d.date + ' — ' + dh(d.totalTTC)}</option>)}
                  </select>
                </label>
              </div>
            ) : null}

            <h3 className="font-bold text-sm mt-4 mb-2">{L('charges')}</h3>
            <Table>
              <thead><tr><th>{L('date')}</th><th>{L('chargeCat')}</th><th>{L('beneficiary')}</th><th>{L('amount')}</th></tr></thead>
              <tbody>
                {tripCharges.map(e => (
                  <tr key={e.id}><td>{e.date}</td><td>{e.category}</td><td>{e.beneficiary || '-'}</td><td>{dh(e.amount)}</td></tr>
                ))}
                {!tripCharges.length ? <tr><td colSpan="4">{L('noData')}</td></tr> : null}
              </tbody>
            </Table>

            {detail.id ? <AttachmentsPanel L={L} entityType="trip" entityId={detail.id} branchId={detail.branch_id} /> : null}
          </Modal>
        );
      })() : null}
    </>
  );
}

function Parties({ L, type }) {
  const canWriteParty = can(type === 'clients' ? 'clients.write' : 'suppliers.write');
  const canDeleteParty = can(type === 'clients' ? 'clients.delete' : 'suppliers.delete');
  const canAssignParty = can(type === 'clients' ? 'clients.assign' : 'suppliers.write');
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(null);
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [err, setErr] = useState('');

  const [outstanding, setOutstanding] = useState({});

  async function load() {
    try {
      const [data, usersData, branchesData] = await Promise.all([loadParties(type), loadUsers(), loadBranches()]);
      setRows(data);
      setUsers(usersData);
      setBranches(branchesData);
      if (type === 'clients') {
        const { data: inv } = await supabase.from('sales').select('client_id, total_ttc, payments_json').eq('stage', 'facture');
        const m = {};
        (inv || []).forEach(d => { if (d.client_id) m[d.client_id] = Number(m[d.client_id] || 0) + Number(paymentInfo(d).rest || 0); });
        setOutstanding(m);
      }
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, [type]);

  async function save() {
    try {
      await saveParty(type, form);
      setForm(null);
      load();
    } catch (e) { alert(e.message); }
  }

  async function remove(id) {
    if (!canDeleteParty) return alert('Suppression non autorisée');
    if (!confirm('Supprimer ?')) return;
    try {
      await deleteParty(type, id);
      load();
    } catch (e) { alert(e.message); }
  }

  function newParty() {
    if (!canWriteParty) return;
    setForm({
      name: '',
      type: 'entreprise',
      ice: '',
      phone: '',
      city: '',
      address: '',
      contact: '',
      assigned_to: getStoredSession()?.user?.id || '',
      branch_id: currentBranchId() || branches[0]?.id || ''
    });
  }

  if (err) return <ErrorBox msg={err} />;

  const filteredRows = (ownerFilter === 'all'
    ? rows
    : rows.filter(x => String(x.assigned_to || '') === String(ownerFilter)))
    .filter(x => !search || [x.name, x.ice, x.phone, x.city, x.assignedToLabel].join(' ').toLowerCase().includes(search.toLowerCase()));

  const uniqueOwners = users.filter(u => rows.some(x => String(x.assigned_to || '') === String(u.id)));

  return (
    <>
      <Header title={type === 'clients' ? L('clients') : L('suppliers')}>
        <input className="input max-w-xs" placeholder={L('search')} value={search} onChange={e => setSearch(e.target.value)} />
        {can('data.export') ? <button onClick={() => downloadCsv((type === 'clients' ? 'clients.csv' : 'fournisseurs.csv'), filteredRows.map(x => ({ nom: x.name, ice: x.ice, telephone: x.phone, ville: x.city, cree_par: x.createdByLabel, affecte_a: x.assignedToLabel })))} className="btn bg-white border">{L('exportCsv')}</button> : null}
        {type === 'clients' ? (
          <select className="input max-w-xs" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
            <option value="all">{L('all')} - {L('clientOwner')}</option>
            {uniqueOwners.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
          </select>
        ) : null}
        {canWriteParty && featureOn('import') ? <button onClick={() => setShowImport(true)} className="btn bg-white border">📥 {L('importExcel')}</button> : null}
        {canWriteParty ? <button onClick={newParty} className="btn bg-amber-500">{L('new')}</button> : null}
      </Header>

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <div className="card p-4"><p className="text-xs text-slate-400">{L('all')}</p><p className="text-2xl font-black">{filteredRows.length}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('clientOwner')}</p><p className="text-2xl font-black">{uniqueOwners.length}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('branch')}</p><p className="text-2xl font-black">{new Set(filteredRows.map(x => x.branch_id).filter(Boolean)).size}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('createdBy')}</p><p className="text-2xl font-black">{new Set(filteredRows.map(x => x.created_by).filter(Boolean)).size}</p></div>
      </div>

      <Table>
        <thead>
          <tr>
            <th>{L('name')}</th>
            <th>ICE / Contact</th>
            <th>{L('phone')}</th>
            <th>{L('city')}</th>
            <th>{L('createdBy')}</th>
            {type === 'clients' ? <th>{L('assignedTo')}</th> : null}
            {type === 'clients' ? <th>{L('outstanding')} / {L('creditLimit')}</th> : null}
            <th>{L('branch')}</th>
            <th>{L('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map(x => (
            <tr key={x.id}>
              <td className="font-semibold">{x.name}</td>
              <td className="text-xs text-slate-500">{x.ice || x.contact || '-'}</td>
              <td>{x.phone || '-'}</td>
              <td>{x.city || '-'}</td>
              <td>{x.createdByLabel || '-'}</td>
              {type === 'clients' ? <td><Badge tone="blue">{x.assignedToLabel || '-'}</Badge></td> : null}
              {type === 'clients' ? (
                <td>
                  <div className={Number(x.credit_limit || 0) > 0 && Number(outstanding[x.id] || 0) > Number(x.credit_limit) ? 'text-red-600 font-bold' : 'font-semibold'}>{dh(outstanding[x.id] || 0)}</div>
                  <div className="text-xs text-slate-400">{Number(x.credit_limit || 0) > 0 ? '/ ' + dh(x.credit_limit) : L('noLimit')}{x.price_tier === 'gros' ? ' · ' + L('wholesale') : ''}</div>
                </td>
              ) : null}
              <td>{branches.find(b => Number(b.id) === Number(x.branch_id))?.name || '-'}</td>
              <td className="flex gap-1 flex-wrap">
                {canWriteParty ? <button onClick={() => setForm(x)} className="btn bg-white border">{L('edit')}</button> : null}
                {canDeleteParty ? <button onClick={() => remove(x.id)} className="btn bg-red-600 text-white">{L('del')}</button> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {form ? (
        <Modal title={type === 'clients' ? L('clients') : L('suppliers')} onClose={() => setForm(null)}>
          {['name', 'ice', 'phone', 'city', 'address'].map(k => (
            <input key={k} className="input mb-2" placeholder={k} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />
          ))}

          {type === 'clients' ? (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="text-xs text-slate-500">{L('priceTier')}
                <select className="input mt-1" disabled={!can('clients.credit_limit')} value={form.price_tier || 'detail'} onChange={e => setForm({ ...form, price_tier: e.target.value })}>
                  <option value="detail">{L('retail')}</option>
                  <option value="gros">{L('wholesale')}</option>
                </select>
              </label>
              <label className="text-xs text-slate-500">{L('creditLimit')} (DH)
                <input className="input mt-1" type="number" min="0" disabled={!can('clients.credit_limit')} value={form.credit_limit ?? 0} onChange={e => setForm({ ...form, credit_limit: e.target.value })} />
                <span className="text-xs text-slate-400">0 = {L('noLimit')}</span>
              </label>
            </div>
          ) : null}

          {type === 'clients' ? (
            <label className="text-xs text-slate-500">{L('assignedTo')}
              <select className="input mt-1 mb-2" value={form.assigned_to || ''} disabled={!canAssignParty} onChange={e => setForm({ ...form, assigned_to: e.target.value ? Number(e.target.value) : null })}>
                <option value="">--</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
              </select>
            </label>
          ) : null}

          {isAdmin(getStoredSession()) ? (
            <label className="text-xs text-slate-500">{L('branch')}
              <select className="input mt-1 mb-2" value={form.branch_id || ''} onChange={e => setForm({ ...form, branch_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">--</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
          ) : null}

          {form.id ? <AttachmentsPanel L={L} entityType={type === 'clients' ? 'client' : 'supplier'} entityId={form.id} branchId={form.branch_id} /> : null}

          <button onClick={save} className="btn bg-amber-500">{L('save')}</button>
        </Modal>
      ) : null}
      {showImport ? <ImportModal L={L} kind={type} branches={branches} close={() => setShowImport(false)} done={load} /> : null}
    </>
  );
}


function canEditUserRow(row) {
  const session = getStoredSession();
  if (isSuperAdminUserRow(row) && !isSuperAdmin(session)) return false;
  return can('users.write');
}

function Users({ L }) {
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');

  async function load() {
    try {
      const [users, rolesData, branchesData] = await Promise.all([loadUsers(), loadRoles(), loadBranches()]);
      setRows(users);
      setRoles(rolesData);
      setBranches(branchesData);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  function newUser() {
    setForm({
      username: '',
      password: 'changeme',
      full_name: '',
      role_id: roles[0]?.id || 3,
      branch_id: branches[0]?.id || '',
      active: true
    });
  }

  function editUser(u) {
    const role = roles.find(r => r.name === u.role);
    setForm({
      id: u.id,
      username: u.username || '',
      password: '',
      full_name: u.full_name || '',
      role_id: role?.id || u.role_id || 3,
      branch_id: u.branch_id || '',
      active: u.active !== false
    });
  }

  async function save() {
    try {
      await saveUser(form);
      setForm(null);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function toggleActive(u) {
    if (!confirm((u.active ? L('deactivate') : L('activate')) + ' ?')) return;
    try {
      await setUserActive(u.id, !u.active);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  if (err) return <ErrorBox msg={err} />;

  return (
    <>
      <Header title={L('users')}>
        <button onClick={newUser} className="btn bg-amber-500">{L('new')}</button>
      </Header>

      <Table>
        <thead>
          <tr>
            <th>{L('username')}</th>
            <th>{L('fullName')}</th>
            <th>{L('role')}</th>
            <th>{L('branch')}</th>
            <th>{L('active')}</th>
            <th>{L('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(u => (
            <tr key={u.id}>
              <td className="font-mono text-xs">{u.username}</td>
              <td>{u.full_name || '-'}</td>
              <td><Badge tone="blue">{u.role || '-'}</Badge></td>
              <td>{u.branch_name || '-'}</td>
              <td>
                <Badge tone={u.active ? 'green' : 'red'}>
                  {u.active ? L('active') : 'Inactif'}
                </Badge>
              </td>
              <td className="flex gap-1 flex-wrap">
                <button onClick={() => editUser(u)} className="btn bg-white border">{L('edit')}</button>
                <button onClick={() => toggleActive(u)} className={u.active ? 'btn bg-red-600 text-white' : 'btn bg-emerald-600 text-white'}>
                  {u.active ? L('deactivate') : L('activate')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {form ? (
        <Modal title={form.id ? L('edit') : L('new')} onClose={() => setForm(null)}>
          <label className="text-xs text-slate-500">{L('username')}
            <input className="input mt-1 mb-2" value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} disabled={!!form.id} />
          </label>

          <label className="text-xs text-slate-500">{L('fullName')}
            <input className="input mt-1 mb-2" value={form.full_name || ''} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </label>

          <label className="text-xs text-slate-500">{form.id ? L('changePassword') : L('password')}
            <input className="input mt-1 mb-2" type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={form.id ? 'Laisser vide pour ne pas changer' : ''} />
          </label>

          <label className="text-xs text-slate-500">{L('role')}
            <select className="input mt-1 mb-2" value={form.role_id || ''} onChange={e => setForm({ ...form, role_id: Number(e.target.value) })}>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>

          <label className="text-xs text-slate-500">{L('branch')}
            <select className="input mt-1 mb-2" value={form.branch_id || ''} onChange={e => setForm({ ...form, branch_id: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Toutes / Aucune</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm mb-4">
            <input type="checkbox" checked={form.active !== false} onChange={e => setForm({ ...form, active: e.target.checked })} />
            {L('active')}
          </label>

          <button onClick={save} className="btn bg-amber-500">{L('save')}</button>
        </Modal>
      ) : null}
    </>
  );
}



function StockMovements({ L }) {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('all');
  const [err, setErr] = useState('');

  async function load() {
    try {
      setErr('');
      setRows(await loadStockMovements());
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  if (err) return <ErrorBox msg={err} />;

  const filtered = tab === 'in'
    ? rows.filter(x => x.quantity > 0)
    : tab === 'out'
      ? rows.filter(x => x.quantity < 0)
      : rows;

  const totalIn = rows.filter(x => x.quantity > 0).reduce((s, x) => s + x.quantity, 0);
  const totalOut = rows.filter(x => x.quantity < 0).reduce((s, x) => s + Math.abs(x.quantity), 0);

  return (
    <>
      <Header title={L('stockMoves')}>
        <button onClick={load} className="btn bg-white border">↻</button>
      </Header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="card p-4"><p className="text-xs text-slate-400">{L('stockIn')}</p><p className="text-2xl font-black text-emerald-600">{fmt(totalIn)}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('stockOut')}</p><p className="text-2xl font-black text-red-600">{fmt(totalOut)}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('movement')}</p><p className="text-2xl font-black">{rows.length}</p></div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('all')} className={'btn ' + (tab === 'all' ? 'bg-slate-800 text-white' : 'bg-white border')}>{L('all')}</button>
        <button onClick={() => setTab('in')} className={'btn ' + (tab === 'in' ? 'bg-emerald-600 text-white' : 'bg-white border')}>{L('stockIn')}</button>
        <button onClick={() => setTab('out')} className={'btn ' + (tab === 'out' ? 'bg-red-600 text-white' : 'bg-white border')}>{L('stockOut')}</button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>{L('date')}</th>
            <th>{L('ref')}</th>
            <th>{L('product')}</th>
            <th>{L('location')}</th>
            <th>{L('quantity')}</th>
            <th>{L('docType')}</th>
            <th>N° Doc</th>
            <th>{L('actor')}</th>
            <th>{L('reason')}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.id}>
              <td>{m.date ? new Date(m.date).toLocaleString('fr-FR') : '-'}</td>
              <td className="font-mono text-xs">{m.ref || '-'}</td>
              <td className="font-semibold">{m.productName || '-'}</td>
              <td><Badge tone="blue">{m.branchName || '-'}</Badge></td>
              <td><Badge tone={m.quantity >= 0 ? 'green' : 'red'}>{m.quantity >= 0 ? '+' : ''}{fmt(m.quantity)}</Badge></td>
              <td>{m.docType || '-'}</td>
              <td className="font-mono text-xs">{m.docNumber || '-'}</td>
              <td>{m.userLabel || '-'}</td>
              <td>{m.reason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

function AuditLog({ L }) {
  const [rows, setRows] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [textFilter, setTextFilter] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    try {
      setErr('');
      setRows(await loadAuditLogs());
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  if (err) return <ErrorBox msg={err} />;

  const modules = ['all', ...Array.from(new Set(rows.map(x => x.module).filter(Boolean)))];
  const actions = ['all', ...Array.from(new Set(rows.map(x => x.action).filter(Boolean)))];

  const filtered = rows.filter(x => {
    const txt = `${x.user_label || ''} ${x.module || ''} ${x.action || ''} ${x.object_label || ''} ${x.detail || ''}`.toLowerCase();
    return (moduleFilter === 'all' || x.module === moduleFilter) &&
      (actionFilter === 'all' || x.action === actionFilter) &&
      (!textFilter || txt.includes(textFilter.toLowerCase()));
  });

  function tone(action) {
    if (['CREATE', 'ADVANCE', 'PAYMENT', 'STOCK', 'PARTIAL_DELIVERY', 'PARTIAL_RECEIPT'].includes(action)) return 'green';
    if (['DELETE', 'CANCEL_PAYMENT'].includes(action)) return 'red';
    if (['UPDATE'].includes(action)) return 'amber';
    return 'blue';
  }

  const stats = {
    total: rows.length,
    today: rows.filter(x => (x.created_at || '').slice(0, 10) === today()).length,
    users: new Set(rows.map(x => x.user_label).filter(Boolean)).size,
    delete: rows.filter(x => ['DELETE', 'CANCEL_PAYMENT'].includes(x.action)).length
  };

  return (
    <>
      <Header title={L('audit')}>
        <button onClick={load} className="btn bg-white border">↻</button>
      </Header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="card p-4"><p className="text-xs text-slate-400">Total actions</p><p className="text-2xl font-black">{stats.total}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">Aujourd’hui</p><p className="text-2xl font-black">{stats.today}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">{L('actor')}</p><p className="text-2xl font-black">{stats.users}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-400">Actions sensibles</p><p className="text-2xl font-black text-red-600">{stats.delete}</p></div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <select className="input max-w-xs" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
          {modules.map(m => <option key={m} value={m}>{m === 'all' ? L('all') : m}</option>)}
        </select>
        <select className="input max-w-xs" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          {actions.map(a => <option key={a} value={a}>{a === 'all' ? L('all') : docActionLabel(a)}</option>)}
        </select>
        <input className="input max-w-xs" placeholder="Recherche..." value={textFilter} onChange={e => setTextFilter(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="table w-full audit-table">
          <thead>
            <tr>
              <th>{L('date')}</th>
              <th>{L('actor')}</th>
              <th>{L('module')}</th>
              <th>{L('actions')}</th>
              <th>{L('object')}</th>
              <th>{L('detail')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(x => (
              <tr key={x.id}>
                <td>
                  <div className="font-semibold">{x.created_at ? new Date(x.created_at).toLocaleDateString('fr-FR') : '-'}</div>
                  <div className="text-xs text-slate-400">{x.created_at ? new Date(x.created_at).toLocaleTimeString('fr-FR') : ''}</div>
                </td>
                <td>{x.user_label || '-'}</td>
                <td><Badge tone="slate">{x.module || '-'}</Badge></td>
                <td><Badge tone={tone(x.action)}>{docActionLabel(x.action)}</Badge></td>
                <td className="font-semibold">{x.object_label || '-'}</td>
                <td className="text-slate-600">{x.detail || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}


function MobileAppAdmin({ L }) {
  const baseUrl = window.location.origin;
  const links = [
    {
      title: L('androidApp'),
      desc: L('androidNote'),
      href: '/mobile/drogueriepro-android.apk',
      action: L('downloadAndroid'),
      badge: 'APK'
    },
    {
      title: L('iosApp'),
      desc: L('appStoreNote'),
      href: '/mobile/drogueriepro-ios-install.html',
      action: L('downloadIos'),
      badge: 'iOS'
    },
    {
      title: L('installGuide'),
      desc: 'Guide rapide pour installer l’application mobile sur Android et iPhone.',
      href: '/mobile/README_MOBILE.html',
      action: L('installGuide'),
      badge: 'Guide'
    }
  ];

  return (
    <>
      <Header title={L('mobileAdminPortal')}>
        <a className="btn bg-white border" href={baseUrl + '/manifest.webmanifest'} target="_blank" rel="noreferrer">Manifest</a>
      </Header>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        {links.map(x => (
          <div key={x.title} className="card p-5 mobile-app-card">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="text-xs text-slate-400">{x.badge}</div>
                <h2 className="text-lg font-black">{x.title}</h2>
              </div>
              <Badge tone={x.badge === 'APK' ? 'green' : x.badge === 'iOS' ? 'blue' : 'amber'}>{x.badge}</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-3 min-h-[64px]">{x.desc}</p>
            <a className="btn bg-amber-500 w-full mt-4" href={x.href} download>{x.action}</a>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-2">Publication native</h2>
        <p className="text-sm text-slate-600">
          Le portail fournit les liens de téléchargement. Pour générer les fichiers réels :
          Android = APK/AAB via Android Studio. iOS = Archive Xcode puis TestFlight/App Store.
        </p>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <b>Android</b>
            <p className="text-xs text-slate-500 mt-1">Générer un APK signé et le placer dans <span className="font-mono">frontend/public/mobile/drogueriepro-android.apk</span>.</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <b>iOS</b>
            <p className="text-xs text-slate-500 mt-1">Publier via TestFlight/App Store puis mettre le lien dans <span className="font-mono">drogueriepro-ios-install.html</span>.</p>
          </div>
        </div>
      </div>
    </>
  );
}


function Settings({ L }) {
  const [settings, setSettings] = useState(null);
  const [err, setErr] = useState('');

  async function load() {
    try {
      const data = await loadSettings();
      setSettings(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    try {
      await saveSettings(settings);
      alert('Paramètres enregistrés');
    } catch (e) {
      alert(e.message);
    }
  }

  if (err) return <ErrorBox msg={err} />;
  if (!settings) return <p>Chargement...</p>;

  return (
    <>
      <Header title={L('settings') || 'Paramètres'}>
        <button onClick={save} className="btn bg-amber-500">{L('save') || 'Enregistrer'}</button>
      </Header>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-bold mb-3">{L('company') || 'Société'}</h2>

          <label className="text-xs text-slate-500">{L('company') || 'Société'}
            <input className="input mt-1 mb-2" value={settings.company_name || ''} onChange={e => setSettings({ ...settings, company_name: e.target.value })} />
          </label>

          <label className="text-xs text-slate-500">{L('ice') || 'ICE'}
            <input className="input mt-1 mb-2" value={settings.company_ice || ''} onChange={e => setSettings({ ...settings, company_ice: e.target.value })} />
          </label>

          <label className="text-xs text-slate-500">{L('phone') || 'Téléphone'}
            <input className="input mt-1 mb-2" value={settings.company_phone || ''} onChange={e => setSettings({ ...settings, company_phone: e.target.value })} />
          </label>

          <label className="text-xs text-slate-500">{L('address') || 'Adresse'}
            <textarea className="input mt-1" value={settings.company_address || ''} onChange={e => setSettings({ ...settings, company_address: e.target.value })} />
          </label>
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-3">Paramètres généraux</h2>

          <label className="text-xs text-slate-500">{L('vat') || 'TVA'} %
            <input className="input mt-1 mb-2" type="number" value={settings.vat_rate || '20'} onChange={e => setSettings({ ...settings, vat_rate: e.target.value })} />
          </label>

          <label className="text-xs text-slate-500">{L('theme') || 'Thème'}
            <select className="input mt-1" value={settings.theme || 'light'} onChange={e => setSettings({ ...settings, theme: e.target.value })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="corporate">Corporate</option>
            </select>
          </label>
        </div>

        <div className="card p-5 md:col-span-2">
          <h2 className="font-bold mb-1">{L('alertsSettings')}</h2>
          <p className="text-xs text-slate-500 mb-4">{L('alertsSettingsHint')}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ['alert_stock_enabled', L('alertStock'), null, null],
              ['alert_expiry_enabled', L('alertExpiry'), 'alert_expiry_days', L('alertExpiryDays')],
              ['alert_unpaid_enabled', L('alertUnpaid'), 'alert_unpaid_days', L('alertUnpaidDays')],
              ['alert_margin_enabled', L('alertMargin'), 'alert_margin_min', L('alertMarginMin')]
            ].map(([flag, label, valueKey, valueLabel]) => (
              <div key={flag} className="border rounded-xl p-3 bg-slate-50">
                <label className="flex items-center gap-2 font-semibold text-sm">
                  <input type="checkbox" checked={String(settings[flag] ?? '1') !== '0'} onChange={e => setSettings({ ...settings, [flag]: e.target.checked ? '1' : '0' })} />
                  {label}
                </label>
                {valueKey ? (
                  <label className="text-xs text-slate-500 block mt-2">{valueLabel}
                    <input className="input mt-1" type="number" min="0" disabled={String(settings[flag] ?? '1') === '0'} value={settings[valueKey] ?? ''} onChange={e => setSettings({ ...settings, [valueKey]: e.target.value })} />
                  </label>
                ) : <p className="text-xs text-slate-400 mt-2">{L('alertStockHint')}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- V49 : page Autorisations ---------- */
const BUILTIN_ROLES = ['Administrateur', 'Gérant', 'Vendeur', 'Magasinier', 'SuperAdmin', 'Super Administrateur'];

function PermSwitch({ on, onChange, disabled, title, partial }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} title={title || ''} disabled={disabled}
      onClick={() => { if (!disabled) onChange(!on); }}
      className={'perm-switch' + (on ? ' on' : '') + (partial && !on ? ' partial' : '') + (disabled ? ' dis' : '')}>
      <span />
    </button>
  );
}

function Permissions({ L }) {
  const session = getStoredSession();
  const superA = isSuperAdmin(session);
  const canSettings = can('settings.manage');
  const [tab, setTab] = useState('profile');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [roleId, setRoleId] = useState(null);
  const [draft, setDraft] = useState({});
  const [notice, setNotice] = useState(null);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [roleForm, setRoleForm] = useState(null);
  const [featuresOff, setFeaturesOff] = useState(getFeaturesOff());
  const [saasOff, setSaasOff] = useState(getDisabledModulesCache());

  async function load(keepRole) {
    try {
      setErr('');
      const d = await loadPermissionsMatrix();
      setData(d);
      setDraft({});
      const first = d.roles.find(r => !BUILTIN_ROLES.slice(4).includes(r.name)) || d.roles[0];
      setRoleId(prev => (keepRole && d.roles.some(r => Number(r.id) === Number(keepRole))) ? Number(keepRole) : (prev && d.roles.some(r => Number(r.id) === Number(prev)) ? prev : (first ? Number(first.id) : null)));
      setFeaturesOff(await refreshFeaturesCache());
      setSaasOff(getDisabledModulesCache());
    } catch (e) {
      console.error('Permissions load error:', e);
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  if (err) return <ErrorBox msg={err} />;
  if (!data) return <div className="card p-6 text-slate-500">…</div>;

  const idByCode = Object.fromEntries(data.permissions.map(p => [p.code, Number(p.id)]));
  const codeById = Object.fromEntries(data.permissions.map(p => [Number(p.id), p.code]));
  const dbPermByCode = Object.fromEntries(data.permissions.map(p => [p.code, p]));
  const original = rid => new Set(data.rolePerms.filter(x => Number(x.role_id) === Number(rid)).map(x => codeById[Number(x.permission_id)]).filter(Boolean));
  const current = rid => draft[rid] || original(rid);
  const sameSet = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
  const dirtyRoles = data.roles.filter(r => draft[r.id] && !sameSet(draft[r.id], original(r.id)));
  const pendingCount = dirtyRoles.reduce((n, r) => {
    const o = original(r.id), c = draft[r.id];
    return n + [...c].filter(x => !o.has(x)).length + [...o].filter(x => !c.has(x)).length;
  }, 0);

  // Modules affichés : catalogue + droits présents en base mais inconnus du catalogue
  const modules = PERM_MODULES.filter(m => !m.saas || superA).map(m => ({ ...m, perms: m.perms.filter(p => superA || !isSaasPermission(p.code)) }));
  const extra = data.permissions.filter(p => !PERM_INDEX[p.code] && (superA || !isSaasPermission(p.code)));
  if (extra.length) modules.push({ key: 'other', fr: 'Autres droits', ar: 'صلاحيات أخرى', icon: '•', perms: extra.map(p => PD(p.code, p.label || p.code, p.label || p.code)) });
  const missing = modules.flatMap(m => m.perms).filter(p => !idByCode[p.code]).map(p => p.code);

  const role = data.roles.find(r => Number(r.id) === Number(roleId));
  const isLocked = (r, code) => code === 'permissions.manage' && (r?.name === 'Administrateur' || r?.name === session?.user?.role || isSuperAdminUserRow({ roles: { name: r?.name } }));
  const label = code => (PERM_INDEX[code] ? tr(PERM_INDEX[code]) : (dbPermByCode[code]?.label || code));
  const usersOf = rid => (data.users || []).filter(u => Number(u.role_id) === Number(rid));
  const featureOff = key => !!key && (featuresOff.includes(key) || (FEATURES.find(f => f.key === key)?.saas && saasOff.includes(FEATURES.find(f => f.key === key).saas)));

  function setRoleCodes(rid, set) {
    const known = new Set([...set].filter(c => idByCode[c]));
    setDraft(d => ({ ...d, [rid]: known }));
  }

  function toggle(r, code, on) {
    const cur = current(r.id);
    if (!on && isLocked(r, code)) { setNotice({ tone: 'red', text: L('permLocked') }); return; }
    if (on) {
      const { set, added } = permWithDeps(cur, code);
      setRoleCodes(r.id, set);
      setNotice(added.length ? { tone: 'amber', text: L('permAlsoOn') + ' ' + added.map(label).join(', ') } : null);
    } else {
      const { set, removed } = permWithoutDependents(cur, code);
      const kept = removed.filter(c => isLocked(r, c));
      kept.forEach(c => set.add(c));
      const really = removed.filter(c => !kept.includes(c));
      setRoleCodes(r.id, set);
      setNotice(really.length ? { tone: 'amber', text: L('permAlsoOff') + ' ' + really.map(label).join(', ') } : null);
    }
  }

  function toggleModule(r, mod, on) {
    let set = current(r.id);
    const removedAll = [];
    for (const p of mod.perms) {
      if (!idByCode[p.code]) continue;
      if (on) set = permWithDeps(set, p.code).set;
      else if (!isLocked(r, p.code)) { const res = permWithoutDependents(set, p.code); set = res.set; removedAll.push(...res.removed); }
    }
    for (const c of removedAll) if (isLocked(r, c)) set.add(c);
    setRoleCodes(r.id, set);
    setNotice(null);
  }

  function applySet(r, set) {
    data.permissions.forEach(p => { if (isLocked(r, p.code) && current(r.id).has(p.code)) set.add(p.code); });
    if (!superA) current(r.id).forEach(c => { if (isSaasPermission(c)) set.add(c); });
    setRoleCodes(r.id, set);
    setNotice(null);
  }

  async function save() {
    if (!dirtyRoles.length) return;
    setBusy(true);
    try {
      for (const r of dirtyRoles) await saveRolePermissions(r, original(r.id), draft[r.id], idByCode);
      // Mes propres droits ont changé : on rafraîchit la session tout de suite
      if (dirtyRoles.some(r => r.name === session?.user?.role)) {
        const s = getStoredSession();
        const perms = await getUserPermissions(s.user.id);
        setStoredSession({ ...s, perms });
        window.dispatchEvent(new CustomEvent('droguerie_perms_changed'));
      }
      setNotice({ tone: 'green', text: L('permSaved') });
      await load(roleId);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitRole() {
    try {
      const f = roleForm;
      if (!String(f.name || '').trim()) return alert(L('permProfileName'));
      if (f.id) {
        await updateRole(f.id, { name: f.name.trim(), description: f.description || '' });
        setRoleForm(null);
        await load(f.id);
        return;
      }
      const created = await createRole({ name: f.name.trim(), description: f.description || '' });
      let set = new Set();
      if (f.base?.startsWith('tpl:')) set = templateCodes(ROLE_TEMPLATES.find(t => t.key === f.base.slice(4)));
      if (f.base?.startsWith('role:')) set = current(Number(f.base.slice(5)));
      if (set.size) await saveRolePermissions(created, new Set(), new Set([...set].filter(c => idByCode[c])), idByCode);
      setRoleForm(null);
      await load(created.id);
    } catch (e) {
      alert(e.message);
    }
  }

  async function removeRole(r) {
    if (usersOf(r.id).length) return alert(L('permHasUsers'));
    if (!confirm(L('permDeleteConfirm') + '\n\n' + r.name)) return;
    try {
      await deleteRole(r.id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function toggleFeature(key, on) {
    const next = on ? featuresOff.filter(x => x !== key) : [...featuresOff, key];
    try {
      await saveFeaturesOff(next);
      setFeaturesOff(next);
      setNotice({ tone: 'green', text: L('permFeaturesSaved') });
    } catch (e) {
      alert(e.message);
    }
  }

  const ql = q.trim().toLowerCase();
  const matches = p => !ql || [p.code, p.fr, p.ar, p.dfr, p.dar].some(x => String(x || '').toLowerCase().includes(ql));
  const toneCls = { red: 'bg-red-50 text-red-700 border-red-200', amber: 'bg-amber-50 text-amber-800 border-amber-200', green: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

  return (
    <>
      <Header title={L('permissions')}>
        {dirtyRoles.length ? <button onClick={() => { setDraft({}); setNotice(null); }} className="btn bg-white border">{L('permCancel')}</button> : null}
        <button disabled={busy || !dirtyRoles.length} onClick={save} className={'btn ' + (dirtyRoles.length ? 'bg-amber-500' : 'bg-slate-200 text-slate-500')}>💾 {L('permSave')}{pendingCount ? ' (' + pendingCount + ')' : ''}</button>
        <button onClick={() => { if (!dirtyRoles.length || confirm(L('permUnsaved'))) load(roleId); }} className="btn bg-white border">↻</button>
      </Header>

      <div className="flex flex-wrap gap-2 mb-4 perm-tabs">
        {[['profile', L('permByProfile')], ['overview', L('permOverview')], ['features', L('permFeatures')]].map(([k, t]) => (
          <button key={k} onClick={() => setTab(k)} className={'btn ' + (tab === k ? 'bg-slate-900 text-white' : 'bg-white border')}>{t}</button>
        ))}
        {dirtyRoles.length ? <span className="self-center text-sm text-amber-700 font-semibold">● {pendingCount} {L('permPending')}</span> : null}
      </div>

      {missing.length ? <div className="card p-3 mb-3 text-sm bg-amber-50 border-amber-200 text-amber-800">{L('permSqlMissing')}</div> : null}
      {notice ? <div className={'card p-3 mb-3 text-sm border ' + (toneCls[notice.tone] || '')}>{notice.text}</div> : null}

      {tab === 'profile' ? (
        <div className="grid lg:grid-cols-4 gap-4 items-start">
          <div className="card p-3 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <b className="text-sm">{L('permProfiles')}</b>
              <button onClick={() => setRoleForm({ name: '', description: '', base: '' })} className="btn bg-amber-500 text-xs px-2 py-1">+ {L('permNewProfile')}</button>
            </div>
            {data.roles.map(r => {
              const n = [...current(r.id)].filter(c => superA || !isSaasPermission(c)).length;
              const dirty = dirtyRoles.some(x => x.id === r.id);
              return (
                <button key={r.id} onClick={() => setRoleId(Number(r.id))} className={'w-full text-left p-3 rounded-lg border perm-role ' + (Number(r.id) === Number(roleId) ? 'border-amber-500 bg-amber-50' : 'bg-white hover:bg-slate-50')}>
                  <div className="font-semibold flex justify-between gap-2"><span>{r.name}</span>{dirty ? <span className="text-amber-600">●</span> : null}</div>
                  <div className="text-xs text-slate-500">{usersOf(r.id).length} {L('permUsersCount')} · {n} {L('permRightsCount')}</div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-3 space-y-3">
            {!role ? <div className="card p-6 text-slate-500">{L('permSelectProfile')}</div> : (
              <>
                <div className="card p-4">
                  <div className="flex flex-wrap justify-between gap-3 items-start">
                    <div>
                      <h2 className="text-xl font-bold">{role.name}</h2>
                      <p className="text-sm text-slate-500">{role.description || ''}{BUILTIN_ROLES.includes(role.name) ? ' · ' + L('permBuiltIn') : ''}</p>
                      <p className="text-xs text-slate-400 mt-1">{usersOf(role.id).map(u => u.full_name || u.username).join(', ')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select className="input" style={{ width: 'auto' }} value="" onChange={e => { const t = ROLE_TEMPLATES.find(x => x.key === e.target.value); if (t) applySet(role, templateCodes(t)); }}>
                        <option value="">{L('permTemplate')}…</option>
                        {ROLE_TEMPLATES.map(t => <option key={t.key} value={t.key}>{L(t.label)}</option>)}
                      </select>
                      <select className="input" style={{ width: 'auto' }} value="" onChange={e => { if (e.target.value) applySet(role, new Set(current(Number(e.target.value)))); }}>
                        <option value="">{L('permCopyFrom')}</option>
                        {data.roles.filter(r => r.id !== role.id).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <button onClick={() => applySet(role, new Set(modules.flatMap(m => m.perms.map(p => p.code)).filter(c => idByCode[c])))} className="btn bg-white border">{L('permAll')}</button>
                      <button onClick={() => applySet(role, new Set())} className="btn bg-white border">{L('permNone')}</button>
                      {!BUILTIN_ROLES.includes(role.name) ? <button onClick={() => setRoleForm({ id: role.id, name: role.name, description: role.description || '' })} className="btn bg-white border">{L('permRename')}</button> : null}
                      {!BUILTIN_ROLES.includes(role.name) ? <button onClick={() => removeRole(role)} className="btn bg-red-50 text-red-600">{L('permDeleteProfile')}</button> : null}
                    </div>
                  </div>
                  <input className="input mt-3" placeholder={'🔎 ' + L('permSearch')} value={q} onChange={e => setQ(e.target.value)} />
                </div>

                <div className="grid xl:grid-cols-2 gap-3">
                  {modules.map(m => {
                    const perms = m.perms.filter(matches);
                    if (!perms.length) return null;
                    const cur = current(role.id);
                    const onCount = m.perms.filter(p => cur.has(p.code)).length;
                    const modOff = m.feature && featureOff(m.feature);
                    return (
                      <div key={m.key} className="card perm-module">
                        <div className="flex items-center justify-between gap-3 p-3 border-b bg-slate-50 rounded-t-xl">
                          <div>
                            <div className="font-bold">{m.icon} {tr(m)}</div>
                            <div className="text-xs text-slate-500"><span dir="ltr">{onCount} / {m.perms.length}</span>{modOff ? ' · ' + L('permFeatureOff') : ''}</div>
                          </div>
                          <PermSwitch on={onCount === m.perms.length} partial={onCount > 0} title={L('permModuleAll')} onChange={v => toggleModule(role, m, v)} />
                        </div>
                        <div className="divide-y">
                          {perms.map(p => {
                            const on = cur.has(p.code);
                            const absent = !idByCode[p.code];
                            const locked = on && isLocked(role, p.code);
                            const fOff = featureOff(p.feature);
                            const deps = (PERM_DEPS[p.code] || []).map(label);
                            return (
                              <div key={p.code} className={'flex items-start gap-3 p-3 perm-row' + (fOff ? ' opacity-60' : '')}>
                                <PermSwitch on={on} disabled={absent || locked} title={locked ? L('permLocked') : ''} onChange={v => toggle(role, p.code, v)} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm">{tr(p)} {locked ? '🔒' : ''} {fOff ? <Badge tone="amber">{L('permFeatureOff')}</Badge> : null}</div>
                                  {trd(p) ? <div className="text-xs text-slate-500">{trd(p)}</div> : null}
                                  {deps.length ? <div className="text-xs text-slate-400">{L('permRequires')} : {deps.join(', ')}</div> : null}
                                  <div className="text-[11px] text-slate-300 font-mono">{p.code}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {tab === 'overview' ? (
        <div className="card overflow-auto permissions-pro">
          <table className="table w-full">
            <thead>
              <tr>
                <th style={{ minWidth: 260 }}>{L('permissions')}</th>
                {data.roles.map(r => <th key={r.id} className="text-center">{r.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {modules.map(m => (
                <React.Fragment key={m.key}>
                  <tr><td colSpan={data.roles.length + 1} className="bg-slate-100 font-bold">{m.icon} {tr(m)}{m.feature && featureOff(m.feature) ? ' · ' + L('permFeatureOff') : ''}</td></tr>
                  {m.perms.filter(matches).map(p => (
                    <tr key={p.code}>
                      <td>
                        <div className="font-semibold">{tr(p)}</div>
                        <div className="text-xs text-slate-400 font-mono">{p.code}</div>
                      </td>
                      {data.roles.map(r => {
                        const on = current(r.id).has(p.code);
                        const locked = on && isLocked(r, p.code);
                        return (
                          <td key={r.id} className="text-center">
                            <input type="checkbox" checked={on} disabled={!idByCode[p.code] || locked} onChange={e => toggle(r, p.code, e.target.checked)} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'features' ? (
        <>
          <div className="card p-4 mb-3 text-sm text-slate-600">{L('permFeaturesHint')}</div>
          <div className="grid md:grid-cols-2 gap-3">
            {FEATURES.map(f => {
              const inPlan = !(f.saas && saasOff.includes(f.saas));
              const on = inPlan && !featuresOff.includes(f.key);
              return (
                <div key={f.key} className={'card p-4 flex items-center gap-4 perm-feature' + (inPlan ? '' : ' opacity-60')}>
                  <div className="text-2xl">{f.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold">{tr(f)}</div>
                    <div className="text-xs text-slate-500">{trd(f)}</div>
                    {!inPlan ? <Badge tone="slate">{L('permNotInPlan')}</Badge> : null}
                  </div>
                  <PermSwitch on={on} disabled={!inPlan || !canSettings} title={!canSettings ? 'settings.manage' : ''} onChange={v => toggleFeature(f.key, v)} />
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {roleForm ? (
        <Modal title={roleForm.id ? L('permRename') : L('permNewProfile')} onClose={() => setRoleForm(null)}>
          <label className="text-xs text-slate-500">{L('permProfileName')}
            <input className="input mt-1 mb-3" autoFocus value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} />
          </label>
          <label className="text-xs text-slate-500">{L('permProfileDesc')}
            <input className="input mt-1 mb-3" value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} />
          </label>
          {!roleForm.id ? (
            <label className="text-xs text-slate-500">{L('permTemplate')}
              <select className="input mt-1 mb-3" value={roleForm.base} onChange={e => setRoleForm({ ...roleForm, base: e.target.value })}>
                <option value="">—</option>
                {ROLE_TEMPLATES.map(t => <option key={t.key} value={'tpl:' + t.key}>{L(t.label)}</option>)}
                {data.roles.map(r => <option key={r.id} value={'role:' + r.id}>{L('permCopyFrom')} {r.name}</option>)}
              </select>
            </label>
          ) : null}
          <button onClick={submitRole} className="btn bg-amber-500 w-full">{L('save')}</button>
        </Modal>
      ) : null}
    </>
  );
}

function Branches({ L }) {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');

  async function load() {
    try {
      const [branches, usersData] = await Promise.all([loadBranches(), loadUsersForBranch()]);
      setRows(branches);
      // Le compte plateforme SuperAdmin n'appartient à aucune droguerie : on ne l'affiche pas ici
      setUsers((usersData || []).filter(u => !isSuperAdminUserRow(u) && String(u.username || '').toLowerCase() !== 'superadmin'));
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    try {
      await saveBranch(form);
      setForm(null);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function deactivate(id) {
    if (!confirm('Désactiver cette droguerie ?')) return;

    try {
      await deleteBranch(id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function assign(userId, selectedBranchId) {
    try {
      await assignUserBranch(userId, selectedBranchId ? Number(selectedBranchId) : null);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  if (err) return <ErrorBox msg={err} />;

  return (
    <>
      <Header title={L('branches') || 'Gestion drogueries'}>
        <button onClick={() => setForm({ name: '', city: '', address: '', phone: '', manager_name: '', active: true })} className="btn bg-amber-500">
          {L('new') || 'Nouveau'}
        </button>
      </Header>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {rows.map(b => (
          <div key={b.id} className="card p-4">
            <div className="flex justify-between gap-2">
              <div>
                <h2 className="font-bold text-lg">{b.name}</h2>
                <p className="text-sm text-slate-500">{b.city || '-'}</p>
              </div>
              <Badge tone={b.active ? 'green' : 'red'}>{b.active ? (L('active') || 'Actif') : 'Inactif'}</Badge>
            </div>

            <div className="text-sm text-slate-600 mt-3">
              <p>{L('phone') || 'Téléphone'} : {b.phone || '-'}</p>
              <p>{L('manager') || 'Responsable'} : {b.manager_name || '-'}</p>
              <p>{L('address') || 'Adresse'} : {b.address || '-'}</p>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setForm(b)} className="btn bg-white border">{L('edit') || 'Modifier'}</button>
              <button onClick={() => deactivate(b.id)} className="btn bg-red-600 text-white">{L('deactivate') || 'Désactiver'}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h2 className="font-bold mb-3">Affectation utilisateurs / drogueries</h2>

        <Table>
          <thead>
            <tr>
              <th>{L('username') || 'Utilisateur'}</th>
              <th>{L('name') || 'Nom'}</th>
              <th>Profil</th>
              <th>{L('branch') || 'Droguerie'}</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.full_name || '-'}</td>
                <td>{u.roles?.name || '-'}</td>
                <td>
                  <select className="input" value={u.branch_id || ''} onChange={e => assign(u.id, e.target.value)}>
                    <option value="">Toutes / Aucune</option>
                    {rows.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {form ? (
        <Modal title={L('branches') || 'Droguerie'} onClose={() => setForm(null)}>
          <label className="text-xs text-slate-500">{L('name') || 'Nom'}
            <input className="input mt-1 mb-2" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
          </label>

          <label className="text-xs text-slate-500">{L('city') || 'Ville'}
            <input className="input mt-1 mb-2" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} />
          </label>

          <label className="text-xs text-slate-500">{L('phone') || 'Téléphone'}
            <input className="input mt-1 mb-2" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </label>

          <label className="text-xs text-slate-500">{L('manager') || 'Responsable'}
            <input className="input mt-1 mb-2" value={form.manager_name || ''} onChange={e => setForm({ ...form, manager_name: e.target.value })} />
          </label>

          <label className="text-xs text-slate-500">{L('address') || 'Adresse'}
            <textarea className="input mt-1 mb-2" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
          </label>

          <label className="flex items-center gap-2 text-sm mb-3">
            <input type="checkbox" checked={form.active !== false} onChange={e => setForm({ ...form, active: e.target.checked })} />
            {L('active') || 'Actif'}
          </label>

          <button onClick={save} className="btn bg-amber-500">{L('save') || 'Enregistrer'}</button>
        </Modal>
      ) : null}
    </>
  );
}


createRoot(document.getElementById('root')).render(<App />);


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW registration failed:', err));
  });
}
