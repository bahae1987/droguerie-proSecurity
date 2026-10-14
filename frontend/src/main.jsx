import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { createClient } from '@supabase/supabase-js';
import './index.css';

console.log('DROGUERIEPRO V57 OK');

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

/* =====================================================================
   V52 : charte graphique du client, export Excel, partage WhatsApp
   ===================================================================== */
Object.assign(TXT.fr, {
  brandTitle: 'Identité visuelle (charte graphique)',
  brandHint: 'Logo et couleurs de votre droguerie, repris sur les documents, tickets, exports Excel, messages WhatsApp et dans l\'application.',
  brandLogo: 'Logo',
  brandLogoHint: 'PNG, JPG, SVG ou WebP. Les marges vides sont retirées et le logo est réduit automatiquement.',
  brandLogoChoose: 'Choisir un logo',
  brandLogoRemove: 'Retirer',
  brandPrimary: 'Couleur principale',
  brandAccent: 'Couleur d\'accent',
  brandFromLogo: 'Prendre les couleurs du logo',
  brandPresets: 'Palettes proposées',
  brandSlogan: 'Slogan',
  brandDocFooter: 'Pied de page des documents',
  brandDocFooterHint: 'Ex. : conditions de paiement, horaires, mentions.',
  brandTicketMessage: 'Message en bas du ticket de caisse',
  brandTicketLogo: 'Logo sur le ticket de caisse',
  brandApplyApp: 'Appliquer les couleurs à l\'application (menu, boutons)',
  brandPreview: 'Aperçu',
  brandReset: 'Couleurs par défaut',
  brandSaveHint: 'Cliquez sur « Enregistrer » en haut de la page pour appliquer.',
  companyEmail: 'E-mail',
  companyWebsite: 'Site web',
  companyRib: 'RIB / Banque',
  companyRc: 'RC',
  companyIf: 'IF',
  companyPatente: 'Patente',
  companyCnss: 'CNSS',
  companyLegal: 'Mentions légales',
  poweredBy: 'propulsé par DrogueriePro',
  exportExcel: 'Excel',
  exportCsvShort: 'CSV',
  exportBusy: 'Préparation…',
  xlGenerated: 'Généré le',
  xlBy: 'par',
  xlPeriod: 'Période',
  xlTotal: 'Total',
  xlFullExport: 'Excel complet (toutes les tables)',
  xlFullExportHint: 'Un classeur Excel avec un onglet par table : pratique pour consulter ou analyser vos données.',
  waTitle: 'Envoyer par WhatsApp',
  waPhone: 'Numéro WhatsApp',
  waPhoneHint: 'Formats acceptés : 06…, 07…, 05… ou +212…',
  waPhoneInvalid: 'Numéro invalide',
  waNoPhone: 'Aucun numéro : vous choisirez le contact dans WhatsApp.',
  waSaveNumber: 'Enregistrer ce numéro sur la fiche',
  waLang: 'Langue du message',
  waMessage: 'Message',
  waLinkHint: '{lien} sera remplacé par le lien de téléchargement du PDF.',
  waAttach: 'Document PDF',
  waAttachLink: 'Lien de téléchargement dans le message (recommandé)',
  waAttachFile: 'Fichier PDF à joindre',
  waAttachNone: 'Message seul, sans PDF',
  waLinkDays: 'Lien valable (jours)',
  waSend: 'Ouvrir WhatsApp',
  waPreparing: 'Préparation du PDF…',
  waUploading: 'Mise en ligne du PDF…',
  waLinkFailed: 'Lien impossible (stockage Supabase indisponible) : le PDF a été téléchargé, joignez-le dans la conversation.',
  waFileDesktop: 'Le PDF a été téléchargé : glissez-le dans la conversation WhatsApp qui vient de s\'ouvrir.',
  waTemplates: 'Messages WhatsApp',
  waTemplatesHint: 'Variables : {client} {document} {numero} {date} {montant} {reste} {lien} {factures} {articles} {paiement} {total_facture} {total_regle} {societe} {telephone_societe}. Une ligne dont toutes les variables sont vides est retirée du message.',
  waKind_doc: 'Document (facture, devis, BL…)',
  waKind_statement: 'Relevé de compte',
  waKind_reminder: 'Relance impayés',
  waKind_ticket: 'Ticket de caisse',
  waRestore: 'Modèle par défaut',
  waReminder: 'Relance',
  waDefaultLang: 'Langue proposée par défaut',
  waLinkDefaultDays: 'Validité des liens PDF (jours)',
  statementAt: 'Relevé de compte au',
  shareStatement: 'WhatsApp',
  docPdfShared: 'PDF partagé',
  rcNumber: 'N° BR',
  pBranch: 'Droguerie',
  uxSearch: 'Rechercher…',
  uxPeriod: 'Période',
  uxToday: 'Aujourd\'hui',
  uxWeek: '7 jours',
  uxMonth: 'Ce mois',
  uxAll: 'Tout',
  uxShowMore: 'Afficher plus',
  uxShown: 'affichés',
  uxMore: 'Plus d\'actions',
  uxReset: 'Effacer les filtres',
  uxStatus: 'Statut',
  uxAuthor: 'Auteur',
  uxMode: 'Mode',
  uxNet: 'Solde net',
  uxByMode: 'Par mode de paiement',
  uxAuthorFromDoc: 'Auteur du règlement non enregistré (ancien règlement) : auteur du document',
  uxCanceledBy: 'Annulé par',
  uxReason: 'Motif',
  uxNew: 'Nouveau',
  uxMenuSearch: 'Chercher un écran…',
  uxPalette: 'Aller à… (Ctrl+K)',
  uxNoResult: 'Aucun résultat',
  uxGroup_home: 'Accueil',
  uxGroup_sales: 'Ventes',
  uxGroup_purchases: 'Achats',
  uxGroup_stock: 'Stock',
  uxGroup_finance: 'Finances et analyses',
  uxGroup_admin: 'Administration',
  uxNewSale: 'Vente (devis / commande)',
  uxNewInvoice: 'Facture directe',
  uxNewPurchase: 'Commande fournisseur',
  uxNewReceipt: 'Réception directe',
  uxNewClient: 'Client',
  uxNewSupplier: 'Fournisseur',
  uxNewProduct: 'Produit',
  uxOpenPos: 'Caisse rapide',
  uxMenu: 'Menu',
  uxShortcuts: 'Raccourcis : Ctrl+K aller à · Alt+N nouveau · / rechercher · Échap fermer',
  wiTitleClients: 'Clients comptoir',
  wiTitleSuppliers: 'Fournisseurs divers',
  wiHint: 'Fiches utilisées pour les ventes sans client nommé (caisse rapide, ventes directes). Chaque droguerie a sa fiche par défaut ; « ＋ Ajouter une fiche » en crée d\'autres (ex. : artisans, tarif gros). Réservé à l\'administrateur.',
  wiHintSuppliers: 'Fiches pour les achats ponctuels sans fournisseur habituel. Chaque droguerie a sa fiche par défaut ; « ＋ Ajouter une fiche » en crée d\'autres. Réservé à l\'administrateur.',
  wiMissing: 'Fiche manquante',
  wiCreateMissing: 'Créer les fiches manquantes',
  wiDocs: 'Documents',
  wiTotal: 'Total',
  wiMonth: 'Ce mois',
  wiToday: 'Aujourd\'hui',
  wiLast: 'Dernière opération',
  wiAdminOnly: 'Fiche comptoir : modification réservée à l\'administrateur',
  posVisible: '🏪 Comptoir : afficher ce client dans la caisse rapide',
  posVisibleHint: 'Décochée : le client n\'apparaît plus dans la caisse rapide. Il reste disponible pour les devis, commandes et factures.',
  posHidden: 'Hors caisse',
  posOnly: 'En caisse',
  posAdminOnly: 'Case « Comptoir » : réservée à l\'administrateur',
  wiAdd: 'Ajouter une fiche',
  wiAddTitle: 'Nouvelle fiche comptoir',
  wiAddSupplierTitle: 'Nouveau fournisseur divers',
  wiDefault: 'Par défaut',
  wiDefaultHint: 'Fiche proposée par défaut dans la caisse de la droguerie (la première créée). Elle ne se supprime pas.',
  wiPrivate: 'Ces fiches sont visibles uniquement par l\'administrateur dans les listes Clients et Fournisseurs. La caisse et les documents continuent de les utiliser.',
  wiDeleted: 'Fiche supprimée',
  wiSaved: 'Fiche comptoir enregistrée',
  wiNameHint: 'Nom imprimé sur les tickets et factures comptoir',
  pScope: 'Drogueries',
  pScopeAll: 'Toutes les drogueries',
  pScopeOnly: 'Seulement certaines drogueries',
  pScopeHint: 'Une seule fiche pour toutes les drogueries : mêmes coordonnées, même encours, même plafond de crédit.',
  pOrigin: 'Créé dans',
  pWalkIn: 'Comptoir',
  pWalkInHint: 'Fiche comptoir de la droguerie : utilisée pour les ventes sans client nommé. Elle ne se supprime pas.',
  pSupplierWalkInHint: 'Fiche « fournisseur divers » de la droguerie : achats ponctuels sans fournisseur habituel. Elle ne se supprime pas.',
  pDupTitle: 'Fiche déjà existante',
  pDupHint: 'Une fiche semblable existe déjà. Utilisez-la plutôt que de créer un doublon.',
  pDupUse: 'Utiliser cette fiche',
  pDupShare: 'Utiliser et rendre disponible dans ma droguerie',
  pDupCreate: 'Créer quand même',
  pDupReason_ICE: 'même ICE',
  pDupReason_phone: 'même téléphone',
  pDupReason_name: 'même nom',
  pMerge: 'Fusionner',
  pMergeTitle: 'Fusionner deux fiches',
  pMergeHint: 'Toutes les ventes / achats, pièces jointes et l\'encours de la fiche supprimée passent sur la fiche conservée. Action définitive.',
  pMergeKeep: 'Fiche conservée',
  pMergeRemove: 'Fiche supprimée (doublon)',
  pMergeDone: 'Fusion terminée',
  pBalances: 'Encours par droguerie',
  pHasDocs: 'Cette fiche a des documents : elle ne peut pas être supprimée. Fusionnez-la avec une autre fiche si c\'est un doublon.',
  pContact: 'Contact',
  pDuplicatesFound: 'doublons possibles',
  receiveAction: 'Réceptionner',
  invoiceAction: 'Facturer',
  receiveTitle: 'Réception de la commande',
  invoiceTitle: 'Facturation de la réception',
  supplierBlRef: 'N° BL fournisseur',
  supplierInvRef: 'N° facture fournisseur',
  supplierRef: 'Réf. fournisseur',
  unitPriceHT: 'PU HT',
  unitPriceHTHint: 'Prix d\'achat HT réellement facturé : il met à jour le coût moyen (PMP).',
  rcToInvoice: 'À facturer',
  rcPartial: 'Facturée partiellement',
  rcInvoiced: 'Facturée',
  rcReceivedValue: 'Valeur reçue (HT)',
  rcToInvoiceValue: 'Reste à facturer (HT)',
  rcCount: 'Réceptions',
  rcToInvoiceCount: 'Réceptions à facturer',
  rcSearch: 'Rechercher (N°, fournisseur, BL, produit)',
  rcOrder: 'Commande',
  rcArticles: 'Articles',
  rcInvoicing: 'Facturation',
  rcLines: 'lignes',
  rcDetails: 'Détail',
  rcNone: 'Aucune réception',
  poOpen: 'Ouverte',
  poPartial: 'Partiellement reçue',
  poReceived: 'Reçue',
  poReceipts: 'Réceptions',
  showClosedDocs: 'Afficher les documents soldés',
  originOrder: 'Commande d\'origine'
});
Object.assign(TXT.ar, {
  brandTitle: 'الهوية البصرية',
  brandHint: 'شعار وألوان محلبتكم، تظهر في الوثائق والتذاكر وملفات Excel ورسائل واتساب وفي التطبيق.',
  brandLogo: 'الشعار',
  brandLogoHint: 'PNG أو JPG أو SVG أو WebP. تُحذف الهوامش الفارغة ويُصغَّر الشعار تلقائياً.',
  brandLogoChoose: 'اختيار شعار',
  brandLogoRemove: 'حذف',
  brandPrimary: 'اللون الرئيسي',
  brandAccent: 'لون الإبراز',
  brandFromLogo: 'أخذ الألوان من الشعار',
  brandPresets: 'ألوان مقترحة',
  brandSlogan: 'الشعار النصي',
  brandDocFooter: 'تذييل الوثائق',
  brandDocFooterHint: 'مثال: شروط الأداء، أوقات العمل، بيانات إضافية.',
  brandTicketMessage: 'رسالة أسفل تذكرة الصندوق',
  brandTicketLogo: 'الشعار على تذكرة الصندوق',
  brandApplyApp: 'تطبيق الألوان على التطبيق (القائمة والأزرار)',
  brandPreview: 'معاينة',
  brandReset: 'الألوان الافتراضية',
  brandSaveHint: 'اضغط « حفظ » أعلى الصفحة للتطبيق.',
  companyEmail: 'البريد الإلكتروني',
  companyWebsite: 'الموقع الإلكتروني',
  companyRib: 'الحساب البنكي (RIB)',
  companyRc: 'السجل التجاري',
  companyIf: 'التعريف الضريبي',
  companyPatente: 'الضريبة المهنية',
  companyCnss: 'الضمان الاجتماعي',
  companyLegal: 'البيانات القانونية',
  poweredBy: 'بواسطة DrogueriePro',
  exportExcel: 'Excel',
  exportCsvShort: 'CSV',
  exportBusy: 'جاري التحضير…',
  xlGenerated: 'أُنشئ في',
  xlBy: 'بواسطة',
  xlPeriod: 'الفترة',
  xlTotal: 'المجموع',
  xlFullExport: 'Excel كامل (كل الجداول)',
  xlFullExportHint: 'ملف Excel بورقة لكل جدول، لاستعراض أو تحليل معطياتك.',
  waTitle: 'إرسال عبر واتساب',
  waPhone: 'رقم واتساب',
  waPhoneHint: 'الصيغ المقبولة: …06 أو …07 أو …05 أو …212+',
  waPhoneInvalid: 'رقم غير صالح',
  waNoPhone: 'لا يوجد رقم: ستختار جهة الاتصال داخل واتساب.',
  waSaveNumber: 'حفظ هذا الرقم في البطاقة',
  waLang: 'لغة الرسالة',
  waMessage: 'الرسالة',
  waLinkHint: 'سيُستبدل {lien} برابط تحميل ملف PDF.',
  waAttach: 'وثيقة PDF',
  waAttachLink: 'رابط التحميل داخل الرسالة (مُستحسن)',
  waAttachFile: 'ملف PDF للإرفاق',
  waAttachNone: 'رسالة فقط بدون PDF',
  waLinkDays: 'صلاحية الرابط (أيام)',
  waSend: 'فتح واتساب',
  waPreparing: 'تحضير ملف PDF…',
  waUploading: 'رفع ملف PDF…',
  waLinkFailed: 'تعذّر إنشاء الرابط (التخزين غير متاح): تم تحميل ملف PDF، أرفقه في المحادثة.',
  waFileDesktop: 'تم تحميل ملف PDF: اسحبه إلى محادثة واتساب التي فُتحت.',
  waTemplates: 'رسائل واتساب',
  waTemplatesHint: 'المتغيرات: {client} {document} {numero} {date} {montant} {reste} {lien} {factures} {articles} {paiement} {total_facture} {total_regle} {societe} {telephone_societe}. يُحذف كل سطر تكون كل متغيراته فارغة.',
  waKind_doc: 'وثيقة (فاتورة، عرض أثمان، وصل تسليم…)',
  waKind_statement: 'كشف الحساب',
  waKind_reminder: 'تذكير بالمستحقات',
  waKind_ticket: 'تذكرة الصندوق',
  waRestore: 'النموذج الافتراضي',
  waReminder: 'تذكير',
  waDefaultLang: 'اللغة المقترحة افتراضياً',
  waLinkDefaultDays: 'صلاحية روابط PDF (أيام)',
  statementAt: 'كشف الحساب بتاريخ',
  shareStatement: 'واتساب',
  docPdfShared: 'تمت مشاركة PDF',
  rcNumber: 'رقم وصل الاستلام',
  pBranch: 'المحل',
  uxSearch: 'بحث…',
  uxPeriod: 'الفترة',
  uxToday: 'اليوم',
  uxWeek: '7 أيام',
  uxMonth: 'هذا الشهر',
  uxAll: 'الكل',
  uxShowMore: 'عرض المزيد',
  uxShown: 'معروضة',
  uxMore: 'إجراءات أخرى',
  uxReset: 'مسح المرشحات',
  uxStatus: 'الحالة',
  uxAuthor: 'المنفذ',
  uxMode: 'طريقة الأداء',
  uxNet: 'الصافي',
  uxByMode: 'حسب طريقة الأداء',
  uxAuthorFromDoc: 'منفذ الأداء غير مسجل (أداء قديم): منشئ الوثيقة',
  uxCanceledBy: 'أُلغي بواسطة',
  uxReason: 'السبب',
  uxNew: 'جديد',
  uxMenuSearch: 'ابحث عن صفحة…',
  uxPalette: 'انتقال إلى… (Ctrl+K)',
  uxNoResult: 'لا توجد نتائج',
  uxGroup_home: 'الرئيسية',
  uxGroup_sales: 'المبيعات',
  uxGroup_purchases: 'المشتريات',
  uxGroup_stock: 'المخزون',
  uxGroup_finance: 'المالية والتحليلات',
  uxGroup_admin: 'الإدارة',
  uxNewSale: 'بيع (عرض أثمان / طلبية)',
  uxNewInvoice: 'فاتورة مباشرة',
  uxNewPurchase: 'طلبية مورد',
  uxNewReceipt: 'استلام مباشر',
  uxNewClient: 'زبون',
  uxNewSupplier: 'مورد',
  uxNewProduct: 'منتج',
  uxOpenPos: 'الصندوق السريع',
  uxMenu: 'القائمة',
  uxShortcuts: 'اختصارات: Ctrl+K انتقال · Alt+N جديد · / بحث · Échap إغلاق',
  wiTitleClients: 'الزبناء العابرون',
  wiTitleSuppliers: 'الموردون المتنوعون',
  wiHint: 'بطاقات تُستعمل للبيع بدون زبون مسمى (الصندوق السريع، البيع المباشر). لكل محل بطاقته الافتراضية، ويمكن إضافة بطاقات أخرى. خاص بالمدير.',
  wiHintSuppliers: 'بطاقات للمشتريات العرضية. لكل محل بطاقته الافتراضية، ويمكن إضافة بطاقات أخرى. خاص بالمدير.',
  wiMissing: 'بطاقة غير موجودة',
  wiCreateMissing: 'إنشاء البطاقات الناقصة',
  wiDocs: 'الوثائق',
  wiTotal: 'المجموع',
  wiMonth: 'هذا الشهر',
  wiToday: 'اليوم',
  wiLast: 'آخر عملية',
  wiAdminOnly: 'بطاقة الزبون العابر: التعديل خاص بالمدير',
  posVisible: '🏪 الكونطوار: إظهار هذا الزبون في الصندوق السريع',
  posVisibleHint: 'غير مؤشر: لا يظهر الزبون في الصندوق السريع، ويبقى متاحا لعروض الأسعار والطلبيات والفواتير.',
  posHidden: 'خارج الصندوق',
  posOnly: 'في الصندوق',
  posAdminOnly: 'خانة « الكونطوار »: خاصة بالمدير',
  wiAdd: 'إضافة بطاقة',
  wiAddTitle: 'بطاقة زبون عابر جديدة',
  wiAddSupplierTitle: 'مورد متنوع جديد',
  wiDefault: 'افتراضية',
  wiDefaultHint: 'البطاقة المقترحة افتراضيا في صندوق المحل (أول بطاقة). لا يمكن حذفها.',
  wiPrivate: 'هذه البطاقات تظهر للمدير فقط في قوائم الزبناء والموردين. الصندوق والوثائق تستعملها دائما.',
  wiDeleted: 'تم حذف البطاقة',
  wiSaved: 'تم حفظ البطاقة',
  wiNameHint: 'الاسم المطبوع على التذاكر والفواتير',
  pScope: 'المحلات',
  pScopeAll: 'كل المحلات',
  pScopeOnly: 'محلات محددة فقط',
  pScopeHint: 'بطاقة واحدة لكل المحلات: نفس المعلومات، نفس الرصيد ونفس سقف الكريدي.',
  pOrigin: 'أُنشئ في',
  pWalkIn: 'زبون عابر',
  pWalkInHint: 'بطاقة الزبون العابر للمحل: تُستعمل للبيع بدون زبون مسمى. لا يمكن حذفها.',
  pSupplierWalkInHint: 'بطاقة « مورد متنوع » للمحل: مشتريات عرضية. لا يمكن حذفها.',
  pDupTitle: 'البطاقة موجودة مسبقاً',
  pDupHint: 'توجد بطاقة مشابهة. استعملها بدل إنشاء بطاقة مكررة.',
  pDupUse: 'استعمال هذه البطاقة',
  pDupShare: 'استعمالها وإتاحتها في محلي',
  pDupCreate: 'الإنشاء رغم ذلك',
  pDupReason_ICE: 'نفس ICE',
  pDupReason_phone: 'نفس الهاتف',
  pDupReason_name: 'نفس الاسم',
  pMerge: 'دمج',
  pMergeTitle: 'دمج بطاقتين',
  pMergeHint: 'تنتقل كل المبيعات/المشتريات والمرفقات والرصيد من البطاقة المحذوفة إلى البطاقة المحتفظ بها. عملية نهائية.',
  pMergeKeep: 'البطاقة المحتفظ بها',
  pMergeRemove: 'البطاقة المحذوفة (مكررة)',
  pMergeDone: 'تم الدمج',
  pBalances: 'الرصيد حسب المحل',
  pHasDocs: 'لهذه البطاقة وثائق: لا يمكن حذفها. ادمجها مع بطاقة أخرى إن كانت مكررة.',
  pContact: 'المخاطَب',
  pDuplicatesFound: 'بطاقات مكررة محتملة',
  receiveAction: 'استلام',
  invoiceAction: 'فوترة',
  receiveTitle: 'استلام الطلبية',
  invoiceTitle: 'فوترة وصل الاستلام',
  supplierBlRef: 'رقم وصل تسليم المورد',
  supplierInvRef: 'رقم فاتورة المورد',
  supplierRef: 'مرجع المورد',
  unitPriceHT: 'ثمن الوحدة دون رسوم',
  unitPriceHTHint: 'ثمن الشراء الفعلي دون رسوم: يُحدِّث متوسط التكلفة المرجّح.',
  rcToInvoice: 'للفوترة',
  rcPartial: 'مفوترة جزئياً',
  rcInvoiced: 'مفوترة',
  rcReceivedValue: 'قيمة المستلم (دون رسوم)',
  rcToInvoiceValue: 'الباقي للفوترة (دون رسوم)',
  rcCount: 'الاستلامات',
  rcToInvoiceCount: 'استلامات للفوترة',
  rcSearch: 'بحث (الرقم، المورد، الوصل، المنتج)',
  rcOrder: 'الطلبية',
  rcArticles: 'المواد',
  rcInvoicing: 'الفوترة',
  rcLines: 'سطور',
  rcDetails: 'التفاصيل',
  rcNone: 'لا توجد استلامات',
  poOpen: 'مفتوحة',
  poPartial: 'مستلمة جزئياً',
  poReceived: 'مستلمة',
  poReceipts: 'الاستلامات',
  showClosedDocs: 'عرض الوثائق المنتهية',
  originOrder: 'الطلبية الأصلية'
});

const Lx = lang => key => TXT[lang]?.[key] || TXT.fr[key] || key;
const Lc = key => Lx(curLang())(key);

/* ---------- Charte graphique ---------- */
const BRAND_DEFAULTS = { logo: '', primary: '#0f172a', accent: '#f59e0b', slogan: '', docFooter: '', ticketMessage: '', ticketLogo: true, applyApp: true, name: '' };
const BRAND_PRESETS = [
  ['#0f172a', '#f59e0b'], ['#1e3a8a', '#0ea5e9'], ['#14532d', '#65a30d'], ['#7f1d1d', '#ea580c'],
  ['#312e81', '#9333ea'], ['#134e4a', '#0d9488'], ['#27272a', '#ca8a04'], ['#0c4a6e', '#dc2626']
];
function normHex(v, fallback) {
  const s = String(v || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(s)) return ('#' + s.slice(1).split('').map(c => c + c).join('')).toLowerCase();
  return fallback;
}
function hexRgb(h) { const n = parseInt(normHex(h, '#000000').slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbHex(r, g, b) { return '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join(''); }
function luminance(h) {
  const [r, g, b] = hexRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
// Texte lisible sur une couleur de fond (blanc ou bleu nuit, selon le meilleur contraste)
function textOn(h) { const l = luminance(h); return (1.05 / (l + 0.05)) >= ((l + 0.05) / 0.0589) ? '#ffffff' : '#0f172a'; }
function mixHex(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(...A.map((v, i) => v + (B[i] - v) * t)); }
function readableAccent(h) { return luminance(h) > 0.3 ? mixHex(h, '#000000', 0.45) : h; }

function brandFromSettings(s = {}) {
  return {
    logo: String(s.brand_logo || '').startsWith('data:image/') ? s.brand_logo : '',
    primary: normHex(s.brand_primary, BRAND_DEFAULTS.primary),
    accent: normHex(s.brand_accent, BRAND_DEFAULTS.accent),
    slogan: s.brand_slogan || '',
    docFooter: s.brand_doc_footer || '',
    ticketMessage: s.brand_ticket_message || '',
    ticketLogo: String(s.brand_ticket_logo ?? '1') !== '0',
    applyApp: String(s.brand_apply_app ?? '1') !== '0',
    name: s.company_name && s.company_name !== 'DrogueriePro' ? s.company_name : ''
  };
}
let brandCache = null;
function getBrand() {
  if (brandCache) return brandCache;
  try {
    const b = JSON.parse(localStorage.getItem('droguerie_brand_v52') || 'null');
    if (b) { brandCache = { ...BRAND_DEFAULTS, ...b }; return brandCache; }
  } catch {}
  return { ...BRAND_DEFAULTS };
}
function brandVars(b = getBrand()) {
  const sidebar = luminance(b.primary) < 0.12 ? b.primary : '#0f172a';
  return {
    '--brand-primary': b.primary, '--brand-on-primary': textOn(b.primary),
    '--brand-accent': b.accent, '--brand-on-accent': textOn(b.accent),
    '--brand-accent-soft': mixHex(b.accent, '#ffffff', 0.85), '--brand-accent-text': readableAccent(b.accent),
    '--brand-sidebar': sidebar, '--brand-sidebar-hover': mixHex(sidebar, '#ffffff', 0.12)
  };
}
function applyBrandCss(b = getBrand()) {
  try {
    const r = document.documentElement;
    Object.entries(brandVars(b)).forEach(([k, v]) => r.style.setProperty(k, v));
    if (b.applyApp) r.style.setProperty('--dp-accent', b.accent); else r.style.removeProperty('--dp-accent');
  } catch {}
}
function setBrandCache(b) {
  const next = { ...BRAND_DEFAULTS, ...b };
  const same = brandCache && JSON.stringify(brandCache) === JSON.stringify(next);
  brandCache = next;
  try { localStorage.setItem('droguerie_brand_v52', JSON.stringify(next)); } catch {}
  applyBrandCss(next);
  if (!same) { try { window.dispatchEvent(new CustomEvent('droguerie_brand_changed', { detail: next })); } catch {} }
}
applyBrandCss(getBrand());

function useBrand() {
  const [b, setB] = useState(getBrand());
  useEffect(() => {
    const h = e => setB(e.detail || getBrand());
    window.addEventListener('droguerie_brand_changed', h);
    return () => window.removeEventListener('droguerie_brand_changed', h);
  }, []);
  return b;
}

// Page de connexion : logo et couleurs lisibles sans être connecté (fonction app_public_branding, V52)
async function loadPublicBranding() {
  try {
    const { data, error } = await supabase.rpc('app_public_branding');
    if (error || !data) return null;
    return data;
  } catch { return null; }
}

function docStyle(c = {}) {
  const b = getBrand();
  const primary = normHex(c.primary, b.primary), accent = normHex(c.accent, b.accent);
  return {
    '--doc-primary': primary, '--doc-on-primary': textOn(primary), '--doc-accent': accent,
    '--doc-accent-text': readableAccent(accent), '--doc-primary-soft': mixHex(primary, '#ffffff', 0.93)
  };
}

function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Image illisible')); i.src = src; });
}
function fileToDataUrl(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error || new Error('Lecture impossible')); r.readAsDataURL(file); });
}

// Logo : rendu, recadrage des marges vides, réduction (480 × 200 px max), PNG
async function processLogoFile(file) {
  if (!file) throw new Error('Aucun fichier');
  const isSvg = /svg/i.test(file.type) || /\.svg$/i.test(file.name || '');
  if (!/^image\//.test(file.type || '') && !/\.(png|jpe?g|svg|webp|gif)$/i.test(file.name || '')) throw new Error('Format non pris en charge (PNG, JPG, SVG, WebP)');
  if (file.size > 8 * 1024 * 1024) throw new Error('Fichier trop lourd (8 Mo maximum)');
  const img = await loadImage(await fileToDataUrl(file));
  let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  if (!w || !h) { w = 600; h = 300; }
  const k0 = isSvg ? 900 / Math.max(w, h) : Math.min(1, 1200 / Math.max(w, h));
  const work = document.createElement('canvas');
  work.width = Math.max(1, Math.round(w * k0)); work.height = Math.max(1, Math.round(h * k0));
  const ctx = work.getContext('2d');
  ctx.drawImage(img, 0, 0, work.width, work.height);
  let sx = 0, sy = 0, sw = work.width, sh = work.height;
  try {
    const d = ctx.getImageData(0, 0, work.width, work.height).data;
    let minX = work.width, minY = work.height, maxX = -1, maxY = -1;
    for (let y = 0; y < work.height; y++) {
      for (let x = 0; x < work.width; x++) {
        const i = (y * work.width + x) * 4;
        if (d[i + 3] > 16 && !(d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245)) {
          if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX >= minX && maxY >= minY) {
      const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.03);
      sx = Math.max(0, minX - pad); sy = Math.max(0, minY - pad);
      sw = Math.min(work.width, maxX + pad + 1) - sx; sh = Math.min(work.height, maxY + pad + 1) - sy;
    }
  } catch {}
  let maxW = 480, maxH = 200, out = null, url = '';
  for (let i = 0; i < 6; i++) {
    const k = Math.min(1, maxW / sw, maxH / sh);
    out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(sw * k)); out.height = Math.max(1, Math.round(sh * k));
    const o = out.getContext('2d');
    o.imageSmoothingQuality = 'high';
    o.drawImage(work, sx, sy, sw, sh, 0, 0, out.width, out.height);
    url = out.toDataURL('image/png');
    if (url.length <= 120000) break;
    maxW *= 0.8; maxH *= 0.8;
  }
  return { dataUrl: url, width: out.width, height: out.height };
}

// Couleurs dominantes du logo : accent = couleur vive la plus présente, principale = couleur sombre
async function extractLogoColors(dataUrl) {
  const img = await loadImage(dataUrl);
  const S = 64, c = document.createElement('canvas'); c.width = S; c.height = S;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0, S, S);
  const d = x.getImageData(0, 0, S, S).data;
  const buckets = {};
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
    if (a < 128 || (r > 238 && g > 238 && b > 238)) continue;
    const key = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
    const bk = buckets[key] || (buckets[key] = { n: 0, r: 0, g: 0, b: 0 });
    bk.n++; bk.r += r; bk.g += g; bk.b += b;
  }
  const list = Object.values(buckets).map(bk => {
    const r = bk.r / bk.n, g = bk.g / bk.n, b = bk.b / bk.n, max = Math.max(r, g, b), min = Math.min(r, g, b);
    const hex = rgbHex(r, g, b);
    return { hex, n: bk.n, sat: max ? (max - min) / max : 0, lum: luminance(hex) };
  });
  if (!list.length) return null;
  const dist = (a, b) => { const A = hexRgb(a), B = hexRgb(b); return Math.sqrt(A.reduce((t, v, i) => t + (v - B[i]) ** 2, 0)); };
  // Couleur principale : la couleur sombre la plus présente (sinon la couleur dominante assombrie)
  const byCount = [...list].sort((a, b) => b.n - a.n);
  const darkest = list.filter(c => c.lum < 0.15).sort((a, b) => b.n - a.n)[0];
  const primary = darkest ? darkest.hex : mixHex(byCount[0].hex, '#000000', 0.55);
  // Accent : couleur vive, assez claire et bien distincte de la principale
  const colorful = list.filter(c => c.sat > 0.35 && c.lum > 0.06 && dist(c.hex, primary) > 90).sort((a, b) => b.n * b.sat - a.n * a.sat);
  let acc = colorful[0]?.hex || list.filter(c => dist(c.hex, primary) > 90).sort((a, b) => b.n - a.n)[0]?.hex || mixHex(primary, '#ffffff', 0.45);
  return { primary, accent: acc };
}

function legalLine(c = {}) {
  return [['ICE', c.ice], ['RC', c.rc], ['IF', c.ifNumber], ['Patente', c.patente], ['CNSS', c.cnss]]
    .filter(x => String(x[1] || '').trim()).map(x => x[0] + ' : ' + x[1]).join(' · ');
}

// En-tête commun des documents A4 (factures, devis, BL, relevés)
function DocBrandHeader({ L, company, title, number, date, extra }) {
  const c = company || {};
  return (
    <div className="simple-doc-header">
      <div className="doc-brand-left">
        {c.logo ? <img className="doc-logo" src={c.logo} alt="" /> : null}
        <div>
          <div className="simple-brand">{c.name}</div>
          {c.slogan ? <div className="doc-slogan">{c.slogan}</div> : null}
          {c.address ? <div className="simple-muted">{c.address}</div> : null}
          <div className="simple-muted">{[c.phone ? (L('phone') + ' : ' + c.phone) : '', c.email, c.website].filter(Boolean).join(' · ')}</div>
          {legalLine(c) ? <div className="simple-legal">{legalLine(c)}</div> : null}
        </div>
      </div>
      <div className="simple-title-box">
        <div className="simple-title">{title}</div>
        {number ? <div className="simple-number">{number}</div> : null}
        {date ? <div className="simple-muted">{L('date')} : {date}</div> : null}
        {extra || null}
      </div>
    </div>
  );
}

function DocFooterText({ company }) {
  const c = company || {};
  if (!c.docFooter && !c.rib) return null;
  return (
    <div className="doc-footer-text">
      {c.docFooter ? <div>{c.docFooter}</div> : null}
      {c.rib ? <div>RIB : {c.rib}</div> : null}
    </div>
  );
}

/* ---------- PDF fiable (même rendu sur téléphone et ordinateur, sans ligne coupée) ---------- */
async function waitImages(root) {
  const imgs = [...root.querySelectorAll('img')];
  await Promise.all(imgs.map(i => (i.complete ? null : new Promise(r => { i.onload = r; i.onerror = r; }))));
}

async function elementToPdfBlob(el) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const W = 794; // largeur A4 à 96 ppp
  const host = document.createElement('div');
  if (el.closest && el.closest('.rtl')) host.className = 'rtl';
  host.style.cssText = `position:fixed;left:-12000px;top:0;width:${W}px;background:#fff;pointer-events:none;z-index:-1`;
  const clone = el.cloneNode(true);
  clone.classList.add('pdf-render');
  clone.style.width = W + 'px';
  host.appendChild(clone);
  document.body.appendChild(host);
  try {
    await waitImages(clone);
    const canvas = await html2canvas(clone, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: 1280 });
    const box = clone.getBoundingClientRect();
    const ratio = canvas.width / box.width;
    // Points de coupe autorisés : début de chaque ligne de tableau ou bloc
    const cuts = [...clone.querySelectorAll('tr, .simple-bottom, .simple-footer, .doc-footer-text, .simple-doc-meta, .pdf-block')]
      .map(n => Math.round((n.getBoundingClientRect().top - box.top) * ratio)).filter(v => v > 0).sort((a, b) => a - b);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const margin = 8, imgW = 210 - margin * 2, pxPerMm = canvas.width / imgW;
    const pageHpx = Math.floor((297 - margin * 2 - 6) * pxPerMm);
    let y = 0, pages = 0;
    while (y < canvas.height - 2) {
      let end = Math.min(y + pageHpx, canvas.height);
      if (end < canvas.height) {
        const c = cuts.filter(v => v > y + pageHpx * 0.4 && v <= end).pop();
        if (c) end = c;
      }
      const sliceH = end - y;
      const part = document.createElement('canvas');
      part.width = canvas.width; part.height = sliceH;
      const pc = part.getContext('2d');
      pc.fillStyle = '#ffffff'; pc.fillRect(0, 0, part.width, part.height);
      pc.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      if (pages) pdf.addPage();
      pdf.addImage(part.toDataURL('image/jpeg', 0.9), 'JPEG', margin, margin, imgW, sliceH / pxPerMm);
      pages++; y = end;
    }
    if (pages > 1) {
      for (let i = 1; i <= pages; i++) { pdf.setPage(i); pdf.setFontSize(8); pdf.setTextColor(120); pdf.text(i + ' / ' + pages, 210 - margin, 297 - 4, { align: 'right' }); }
    }
    return pdf.output('blob');
  } finally {
    host.remove();
  }
}

// Rendu d'un composant hors écran puis conversion en PDF (relevé envoyé depuis une relance, etc.)
async function jsxToPdfBlob(jsx) {
  const host = document.createElement('div');
  if (document.querySelector('.rtl')) host.className = 'rtl';
  host.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;background:#fff';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(jsx));
    await new Promise(r => setTimeout(r, 30));
    await waitImages(host);
    return await elementToPdfBlob(host.firstElementChild);
  } finally {
    root.unmount();
    host.remove();
  }
}

function downloadBlobFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function storageSafe(s) {
  return String(s || 'document').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'document';
}

// PDF mis en ligne dans Supabase Storage (bucket privé « attachments ») + lien signé à durée limitée.
// Même chemin pour un même document : le lien donne toujours la dernière version.
async function uploadSharedPdf(blob, folder, name, days) {
  const path = 'partages/' + storageSafe(folder) + '/' + storageSafe(name) + '.pdf';
  const st = supabase.storage.from('attachments');
  const { error } = await st.upload(path, blob, { upsert: true, contentType: 'application/pdf', cacheControl: '60' });
  if (error) throw new Error(error.message || 'Stockage indisponible');
  const { data, error: e2 } = await st.createSignedUrl(path, Math.max(1, Math.min(365, Number(days) || 30)) * 86400);
  if (e2 || !data?.signedUrl) throw new Error(e2?.message || 'Lien indisponible');
  return data.signedUrl;
}

/* ---------- Export Excel (.xlsx) ---------- */
const XL_FMT = { money: '#,##0.00 "DH"', number: '#,##0.00', qty: '#,##0.###', int: '0', pct: '0.0%', date: 'dd/mm/yyyy', datetime: 'dd/mm/yyyy hh:mm' };

function xlValue(v, type) {
  if (v === null || v === undefined || v === '') return null;
  if (['money', 'number', 'qty', 'int'].includes(type)) { const n = Number(v); return Number.isFinite(n) ? n : String(v); }
  if (type === 'pct') { const n = Number(v); return Number.isFinite(n) ? n / 100 : null; }
  if (type === 'date' || type === 'datetime') {
    const s = String(v);
    if (type === 'datetime' && /T|:/.test(s)) {
      const d = new Date(s);
      if (!isNaN(d)) return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()));
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : s;
  }
  if (type === 'bool') { const yes = v === true || v === 'true' || v === 1 || v === '1'; return curLang() === 'ar' ? (yes ? 'نعم' : 'لا') : (yes ? 'Oui' : 'Non'); }
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 32000);
  const s = String(v);
  return s.length > 32000 ? s.slice(0, 32000) : (typeof v === 'number' ? v : s);
}

function xlColLetter(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
function xlArgb(hex) { return 'FF' + normHex(hex, '#000000').slice(1).toUpperCase(); }
function xlCellValue(c, r) { return typeof c.value === 'function' ? c.value(r) : r[c.key]; }

// spec = { fileName, title, period, sheets: [{ name, title, note, columns: [{ key | value(row), header, type, width, total }], rows, totals }] }
async function exportExcel(spec) {
  const ExcelJS = (await import('exceljs')).default;
  const company = await loadCompanySettings().catch(() => ({ name: 'DrogueriePro' }));
  const b = getBrand();
  const primary = normHex(company.primary, b.primary), accent = normHex(company.accent, b.accent);
  const rtl = curLang() === 'ar';
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DrogueriePro'; wb.company = company.name || ''; wb.created = new Date(); wb.title = spec.title || '';
  let logoId = null, logoExt = null;
  if (company.logo) {
    try {
      const img = await loadImage(company.logo);
      logoId = wb.addImage({ base64: company.logo, extension: 'png' });
      let h = 56, w = Math.round(img.width * h / img.height);
      if (w > 180) { w = 180; h = Math.round(img.height * 180 / img.width); }
      logoExt = { width: w, height: h };
    } catch (e) { console.warn('Logo Excel', e?.message || e); logoId = null; }
  }
  const stamp = new Date().toLocaleString('fr-FR');
  const user = currentUserLabel();
  const used = new Set();
  const thin = { style: 'thin', color: { argb: 'FFD7DEE7' } };
  const HEAD = 6;
  for (const sh of spec.sheets || []) {
    let name = String(sh.name || 'Feuille').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31) || 'Feuille';
    let k = 2; const base = name;
    while (used.has(name.toLowerCase())) name = (base.slice(0, 28) + ' ' + k++);
    used.add(name.toLowerCase());
    const cols = sh.columns || [];
    const rows = sh.rows || [];
    const ws = wb.addWorksheet(name, {
      views: [{ rightToLeft: rtl, state: 'frozen', ySplit: HEAD, showGridLines: false }],
      pageSetup: { paperSize: 9, orientation: cols.length > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
        margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.3 } },
      headerFooter: { oddFooter: '&L' + String(company.name || 'DrogueriePro').replace(/&/g, '&&') + '&R' + 'Page &P / &N' }
    });
    const hasLogo = logoId !== null;
    const tc = hasLogo ? 3 : 1;
    const t1 = ws.getCell(1, tc); t1.value = company.name || 'DrogueriePro'; t1.font = { bold: true, size: 16, color: { argb: xlArgb(primary) } };
    const t2 = ws.getCell(2, tc); t2.value = sh.title || spec.title || name; t2.font = { bold: true, size: 12, color: { argb: 'FF0F172A' } };
    const t3 = ws.getCell(3, tc);
    t3.value = [spec.period ? Lc('xlPeriod') + ' : ' + spec.period : '', Lc('xlGenerated') + ' ' + stamp + (user ? ' ' + Lc('xlBy') + ' ' + user : '')].filter(Boolean).join('   ·   ');
    t3.font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
    if (sh.note) { const t4 = ws.getCell(4, tc); t4.value = sh.note; t4.font = { size: 9, color: { argb: 'FF475569' } }; }
    [1, 2, 3].forEach(r => { ws.getRow(r).height = 20; });
    if (hasLogo) ws.addImage(logoId, { tl: { col: 0.15, row: 0.2 }, ext: logoExt, editAs: 'oneCell' });
    // Bande de couleur d'accent sous l'en-tête
    for (let i = 1; i <= Math.max(cols.length, tc); i++) ws.getCell(5, i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: xlArgb(accent) } };
    ws.getRow(5).height = 4;
    const hr = ws.getRow(HEAD); hr.height = 30;
    cols.forEach((c, i) => {
      const cell = hr.getCell(i + 1);
      cell.value = c.header;
      cell.font = { bold: true, color: { argb: xlArgb(textOn(primary)) } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: xlArgb(primary) } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = { top: thin, bottom: thin, left: thin, right: thin };
    });
    const zebra = xlArgb(mixHex(primary, '#ffffff', 0.94));
    rows.forEach((r, ri) => {
      const row = ws.getRow(HEAD + 1 + ri);
      cols.forEach((c, ci) => {
        const cell = row.getCell(ci + 1);
        cell.value = xlValue(xlCellValue(c, r), c.type);
        if (XL_FMT[c.type]) cell.numFmt = XL_FMT[c.type];
        cell.border = { bottom: thin };
        if (ri % 2) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebra } };
        if (['money', 'number', 'qty', 'int', 'pct'].includes(c.type)) cell.alignment = { horizontal: 'right' };
        if (c.bold) cell.font = { bold: true };
      });
    });
    if (!rows.length) ws.getCell(HEAD + 1, 1).value = Lc('noData');
    const totalCols = cols.map((c, i) => ({ c, i })).filter(({ c }) => sh.totals !== false && (c.total === true || (c.total === undefined && c.type === 'money')));
    if (rows.length && totalCols.length) {
      const tr = HEAD + rows.length + 1;
      const row = ws.getRow(tr); row.height = 22;
      cols.forEach((c, i) => {
        const cell = row.getCell(i + 1);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: xlArgb(mixHex(accent, '#ffffff', 0.8)) } };
        cell.border = { top: { style: 'medium', color: { argb: xlArgb(primary) } } };
        cell.font = { bold: true };
      });
      const labelCol = totalCols[0].i === 0 ? null : 1;
      if (labelCol) row.getCell(labelCol).value = Lc('xlTotal');
      totalCols.forEach(({ c, i }) => {
        const L1 = xlColLetter(i + 1);
        const sum = rows.reduce((s, r) => s + (Number(xlCellValue(c, r)) || 0), 0);
        const cell = row.getCell(i + 1);
        cell.value = { formula: `SUBTOTAL(109,${L1}${HEAD + 1}:${L1}${tr - 1})`, result: Math.round(sum * 1000) / 1000 };
        if (XL_FMT[c.type]) cell.numFmt = XL_FMT[c.type];
        cell.alignment = { horizontal: 'right' };
      });
    }
    if (rows.length) ws.autoFilter = { from: { row: HEAD, column: 1 }, to: { row: HEAD, column: Math.max(1, cols.length) } };
    cols.forEach((c, i) => {
      let w = c.width;
      if (!w) {
        const lens = rows.slice(0, 400).map(r => {
          const v = xlCellValue(c, r);
          if (c.type === 'money') return fmt(v).length + 4;
          if (c.type === 'date') return 10;
          if (c.type === 'datetime') return 16;
          return String(v ?? '').length;
        });
        w = Math.max(String(c.header || '').length * 0.9 + 2, ...lens.map(x => x + 2), 8);
        w = Math.min(w, c.type === 'text' || !c.type ? 48 : 22);
      }
      ws.getColumn(i + 1).width = w;
    });
    if (hasLogo && (ws.getColumn(1).width || 0) + (ws.getColumn(2).width || 0) < 24) {
      ws.getColumn(1).width = Math.max(ws.getColumn(1).width || 10, 12);
      ws.getColumn(2).width = Math.max(ws.getColumn(2).width || 10, 12);
    }
    ws.pageSetup.printTitlesRow = `${HEAD}:${HEAD}`;
  }
  const buf = await wb.xlsx.writeBuffer();
  const file = String(spec.fileName || 'DrogueriePro').replace(/\.(xlsx|csv)$/i, '') + '_' + today() + '.xlsx';
  downloadBlobFile(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), file);
  return file;
}

function exportCsvFromSpec(spec) {
  const sh = (spec.sheets || []).find(s => (s.rows || []).length) || (spec.sheets || [])[0];
  if (!sh) return;
  const file = String(spec.fileName || 'DrogueriePro').replace(/\.(xlsx|csv)$/i, '') + '_' + today() + '.csv';
  downloadCsv(file, (sh.rows || []).map(r => Object.fromEntries((sh.columns || []).map(c => {
    const v = xlCellValue(c, r);
    return [c.header, v !== null && typeof v === 'object' ? JSON.stringify(v) : v];
  }))));
}

// Boutons d'export : Excel (principal) + CSV
function ExportButtons({ L, spec, label }) {
  const [busy, setBusy] = useState(false);
  if (!can('data.export')) return null;
  async function run(kind) {
    setBusy(true);
    try {
      const s = typeof spec === 'function' ? await spec() : spec;
      if (!s || !(s.sheets || []).some(x => (x.rows || []).length)) alert(L('noData'));
      else {
        if (kind === 'csv') exportCsvFromSpec(s); else await exportExcel(s);
        auditLog('Export', 'EXPORT', s.fileName || s.title || '', kind.toUpperCase());
      }
    } catch (e) { alert(e.message); }
    setBusy(false);
  }
  return (
    <span className="export-group">
      <button type="button" disabled={busy} onClick={() => run('xlsx')} className="btn export-xlsx">{busy ? L('exportBusy') : '📊 ' + (label || L('exportExcel'))}</button>
      <button type="button" disabled={busy} onClick={() => run('csv')} className="btn export-csv" title="CSV">{L('exportCsvShort')}</button>
    </span>
  );
}

/* ---------- WhatsApp ---------- */
const WA_KINDS = ['doc', 'statement', 'reminder', 'ticket'];
const WA_DEFAULTS = {
  fr: {
    doc: 'Bonjour {client},\nVeuillez trouver votre {document} N° {numero} du {date}, d\'un montant de {montant}.\nReste à régler : {reste}\n📄 {lien}\nCordialement,\n{societe}\n{telephone_societe}',
    statement: 'Bonjour {client},\nVoici votre relevé de compte au {date}.\nTotal facturé : {total_facture}\nTotal réglé : {total_regle}\nSolde dû : {montant}\n📄 {lien}\nCordialement,\n{societe}\n{telephone_societe}',
    reminder: 'Bonjour {client},\nSauf erreur de notre part, les factures suivantes restent à régler :\n{factures}\nTotal dû : {montant}\n📄 Relevé : {lien}\nMerci de bien vouloir procéder au règlement.\nCordialement,\n{societe}\n{telephone_societe}',
    ticket: '{societe}\nTicket {numero} du {date}\n{articles}\nTotal : {montant} ({paiement})\nMerci de votre visite !'
  },
  ar: {
    doc: 'السلام عليكم {client}،\nتجدون {document} رقم {numero} بتاريخ {date}، بمبلغ {montant}.\nالمبلغ المتبقي: {reste}\n📄 {lien}\nمع التحية،\n{societe}\n{telephone_societe}',
    statement: 'السلام عليكم {client}،\nإليكم كشف حسابكم بتاريخ {date}.\nمجموع الفواتير: {total_facture}\nمجموع المؤدى: {total_regle}\nالرصيد المستحق: {montant}\n📄 {lien}\nمع التحية،\n{societe}\n{telephone_societe}',
    reminder: 'السلام عليكم {client}،\nنذكّركم بأن الفواتير التالية لم تُؤدَّ بعد:\n{factures}\nالمجموع المستحق: {montant}\n📄 كشف الحساب: {lien}\nنرجو منكم التفضل بالأداء.\nمع التحية،\n{societe}\n{telephone_societe}',
    ticket: '{societe}\nتذكرة {numero} بتاريخ {date}\n{articles}\nالمجموع: {montant} ({paiement})\nشكراً لزيارتكم!'
  }
};
let waSettingsCache = {};
function cacheWaSettings(s) { waSettingsCache = { ...(s || {}) }; }
function waTemplate(kind, lang, settings) {
  const key = 'wa_tpl_' + kind + '_' + lang;
  const src = settings || waSettingsCache;
  return String(src[key] || '').trim() ? src[key] : WA_DEFAULTS[lang][kind];
}
function waPrefs() {
  let p = {};
  try { p = JSON.parse(localStorage.getItem('droguerie_wa_prefs') || '{}'); } catch {}
  const lang = p.lang || waSettingsCache.wa_default_lang || curLang();
  const days = Number(p.days || waSettingsCache.wa_link_days || 30);
  return { lang: lang === 'ar' ? 'ar' : 'fr', days: days > 0 ? days : 30 };
}
// Remplace les variables ; une ligne dont toutes les variables sont vides est retirée. {lien} est gardé pour l'envoi.
function renderWa(tpl, vars, lang) {
  // Message arabe : montants, numéros et dates isolés (sinon « 0522 45 67 89 » s'affiche à l'envers)
  if (lang === 'ar') {
    vars = Object.fromEntries(Object.entries(vars || {}).map(([k, v]) => {
      const t = String(v ?? '');
      if (!t || /[\u0600-\u06FF]/.test(t)) return [k, v];
      return [k, t.split('\n').map(x => (x ? '\u2066' + x + '\u2069' : x)).join('\n')];
    }));
  }
  return String(tpl || '').split('\n').map(line => {
    const keys = [...line.matchAll(/\{(\w+)\}/g)].map(m => m[1]).filter(k => k === 'lien' || k in vars);
    if (keys.length && !keys.includes('lien') && keys.every(k => String(vars[k] ?? '').trim() === '')) return null;
    return line.replace(/\{(\w+)\}/g, (m, k) => (k === 'lien' ? m : (k in vars ? String(vars[k] ?? '') : m))).replace(/\s+$/, '');
  }).filter(l => l !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
function finalizeWa(text, link) {
  return String(text || '').split('\n').map(l => (l.includes('{lien}') ? (link ? l.split('{lien}').join(link) : null) : l))
    .filter(l => l !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
function waDisplayNumber(n) { return n ? '+' + n.slice(0, 3) + ' ' + n.slice(3).replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5') : ''; }
function frDate(d) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || '')); return m ? `${m[3]}/${m[2]}/${m[1]}` : String(d || ''); }
function canShareFiles() {
  try { return !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.pdf', { type: 'application/pdf' })] })); } catch { return false; }
}
const isMobileDevice = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

/* Fenêtre d'envoi WhatsApp
   kind : doc | statement | reminder | ticket
   party : { id, name, phone, table: 'clients' | 'suppliers' }
   buildVars(lang) : variables du message ; makePdf() : Blob PDF (facultatif) */
function WhatsAppModal({ L, kind, party, buildVars, makePdf, pdfFolder, pdfName, auditModule, auditObject, close }) {
  const prefs = waPrefs();
  const [lang, setLang] = useState(prefs.lang);
  const [phone, setPhone] = useState(party?.phone || '');
  const [message, setMessage] = useState(() => renderWa(waTemplate(kind, prefs.lang), buildVars(prefs.lang), prefs.lang));
  const [edited, setEdited] = useState(false);
  const [attach, setAttach] = useState(makePdf ? 'link' : 'none');
  const [days, setDays] = useState(prefs.days);
  const [saveNum, setSaveNum] = useState(true);
  const [busy, setBusy] = useState('');
  const [info, setInfo] = useState('');
  useEffect(() => { if (!edited) setMessage(renderWa(waTemplate(kind, lang), buildVars(lang), lang)); }, [lang]);

  const num = whatsappNumber(phone);
  const invalid = !!phone.trim() && !num;
  const tableWrite = party?.table === 'suppliers' ? 'suppliers.write' : 'clients.write';
  const canSaveNum = !!(party?.id && party?.table && num && num !== whatsappNumber(party.phone || '') && can(tableWrite));
  const preview = finalizeWa(message, attach === 'link' ? 'https://…/' + storageSafe(pdfName || 'document') + '.pdf' : '');

  async function send() {
    if (invalid) return;
    try { localStorage.setItem('droguerie_wa_prefs', JSON.stringify({ lang, days })); } catch {}
    const mobile = isMobileDevice();
    const nativeFile = attach === 'file' && canShareFiles();
    // Ordinateur : la fenêtre est ouverte tout de suite, sinon le navigateur la bloque après la préparation du PDF
    const win = !mobile && !nativeFile ? window.open('about:blank', '_blank') : null;
    setInfo('');
    try {
      let link = '', blob = null, note = '';
      if (attach !== 'none' && makePdf) { setBusy(L('waPreparing')); blob = await makePdf(); }
      if (attach === 'link' && blob) {
        setBusy(L('waUploading'));
        try { link = await uploadSharedPdf(blob, pdfFolder || 'documents', pdfName || 'document', days); }
        catch (e) { downloadBlobFile(blob, storageSafe(pdfName) + '.pdf'); note = L('waLinkFailed'); }
      }
      const text = finalizeWa(message, link);
      if (attach === 'file' && blob) {
        const file = new File([blob], storageSafe(pdfName) + '.pdf', { type: 'application/pdf' });
        if (nativeFile) {
          await navigator.share({ files: [file], text }).catch(() => {});
          if (win) win.close();
          await afterSend('file');
          setBusy(''); close(); return;
        }
        downloadBlobFile(blob, file.name);
        note = L('waFileDesktop');
      }
      const url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(text);
      if (win) win.location.href = url;
      else if (mobile) window.location.href = url;
      else if (!window.open(url, '_blank')) window.location.href = url;
      await afterSend(attach === 'link' && link ? 'link' : attach);
      setBusy('');
      if (note) setInfo(note); else close();
    } catch (e) {
      if (win) win.close();
      setBusy('');
      alert(e.message);
    }
  }
  async function afterSend(mode) {
    if (saveNum && canSaveNum) {
      const { error } = await supabase.from(party.table).update({ phone: phone.trim() }).eq('id', party.id);
      if (error) console.warn('phone save', error.message);
    }
    auditLog(auditModule || 'WhatsApp', 'SHARE', auditObject || pdfName || party?.name || '', 'WhatsApp ' + (num ? '+' + num : '') + ' · ' + mode);
  }

  return (
    <Modal title={'🟢 ' + L('waTitle') + (party?.name ? ' — ' + party.name : '')} onClose={close} wide>
      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-3 space-y-3">
          <label className="text-xs text-slate-500 block">{L('waPhone')}
            <input className={'input mt-1 ' + (invalid ? 'border-red-500' : '')} inputMode="tel" placeholder="06 12 34 56 78" value={phone} onChange={e => setPhone(e.target.value)} />
          </label>
          <div className="text-xs -mt-2">
            {invalid ? <span className="text-red-600 font-semibold">{L('waPhoneInvalid')} · {L('waPhoneHint')}</span>
              : num ? <span className="text-emerald-700 font-semibold" dir="ltr">✔ {waDisplayNumber(num)}</span>
              : <span className="text-amber-700">{L('waNoPhone')}</span>}
          </div>
          {canSaveNum ? (
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={saveNum} onChange={e => setSaveNum(e.target.checked)} /> {L('waSaveNumber')}</label>
          ) : null}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-slate-500">{L('waLang')}</span>
            {[['fr', 'Français'], ['ar', 'العربية']].map(([k, lbl]) => (
              <button key={k} type="button" onClick={() => setLang(k)} className={'btn text-sm ' + (lang === k ? 'bg-slate-900 text-white' : 'bg-white border')}>{lbl}</button>
            ))}
          </div>
          <label className="text-xs text-slate-500 block">{L('waMessage')}
            <textarea className="input mt-1 font-sans" rows={10} dir={lang === 'ar' ? 'rtl' : 'ltr'} value={message} onChange={e => { setMessage(e.target.value); setEdited(true); }} />
          </label>
          {makePdf && attach === 'link' ? <p className="text-xs text-slate-400 -mt-2">{L('waLinkHint')}</p> : null}
          {makePdf ? (
            <div className="border rounded-xl p-3 space-y-1 text-sm">
              <div className="text-xs text-slate-500 font-semibold">{L('waAttach')}</div>
              {[['link', L('waAttachLink')], ['file', L('waAttachFile')], ['none', L('waAttachNone')]].map(([k, lbl]) => (
                <label key={k} className="flex items-center gap-2"><input type="radio" name="wa-attach" checked={attach === k} onChange={() => setAttach(k)} /> {lbl}</label>
              ))}
              {attach === 'link' ? (
                <label className="text-xs text-slate-500 flex items-center gap-2 mt-1">{L('waLinkDays')}
                  <input className="input" style={{ width: 80 }} type="number" min="1" max="365" value={days} onChange={e => setDays(e.target.value)} />
                </label>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <div className="wa-phone">
            <div className="wa-head">{party?.name || 'WhatsApp'}<small dir="ltr">{num ? waDisplayNumber(num) : ''}</small></div>
            <div className="wa-chat">
              <div className="wa-bubble" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{preview}</div>
            </div>
          </div>
        </div>
      </div>
      {info ? <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mt-3 text-sm">{info}</div> : null}
      <div className="flex flex-wrap justify-end items-center gap-2 mt-4">
        {busy ? <span className="text-sm text-slate-500">{busy}</span> : null}
        <button type="button" onClick={close} className="btn bg-white border">{L('closeBtn')}</button>
        <button type="button" disabled={!!busy || invalid} onClick={send} className="btn wa-send">🟢 {L('waSend')}</button>
      </div>
    </Modal>
  );
}

/* ---------- Relevé de compte (document A4) ---------- */
function StatementDocument({ L, company, party, st, docRef, branchNames = {} }) {
  // V53 : client commun à plusieurs drogueries → colonne « Droguerie »
  const multi = new Set(st.lines.map(e => String(e.branchId || ''))).size > 1;
  return (
    <div className="print-area simple-document" style={docStyle(company)} ref={docRef}>
      <DocBrandHeader L={L} company={company} title={L('statement')} number={party.name} date={frDate(today())} />
      <div className="simple-doc-meta three">
        <div><span>{L('totalInvoiced')}</span><b>{dh(st.totalInvoiced)}</b></div>
        <div><span>{L('totalPaid')}</span><b>{dh(st.totalPaid)}</b></div>
        <div><span>{L('balanceDue')}</span><b>{dh(st.balance)}</b></div>
      </div>
      <table className="simple-lines">
        <thead>
          <tr><th>{L('date')}</th><th>{L('ref')}</th>{multi ? <th>{L('pBranch')}</th> : null}<th>{L('movement')}</th><th>{L('totalInvoiced')}</th><th>{L('totalPaid')}</th><th>{L('balanceDue')}</th></tr>
        </thead>
        <tbody>
          {st.lines.map((e, i) => (
            <tr key={i}>
              <td>{frDate(e.date) || '-'}</td>
              <td className="font-mono">{e.ref}</td>
              {multi ? <td>{branchNames[e.branchId] || '-'}</td> : null}
              <td>{e.kind}</td>
              <td>{e.debit ? dh(e.debit) : '-'}</td>
              <td>{e.credit ? dh(e.credit) : '-'}</td>
              <td className="simple-bold">{dh(e.balance)}</td>
            </tr>
          ))}
          {!st.lines.length ? <tr><td colSpan="6">{L('noData')}</td></tr> : null}
        </tbody>
      </table>
      <div className="simple-bottom">
        <div className="simple-note"><b>{L('note')}</b><p>{L('thankYou') || ''}</p></div>
        <div className="simple-totals">
          <div><span>{L('totalInvoiced')}</span><b>{dh(st.totalInvoiced)}</b></div>
          <div><span>{L('totalPaid')}</span><b>{dh(st.totalPaid)}</b></div>
          <div className="simple-grand"><span>{L('balanceDue')}</span><b>{dh(st.balance)}</b></div>
        </div>
      </div>
      <DocFooterText company={company} />
    </div>
  );
}

function statementVars(party, st, company) {
  return lang => ({
    client: party.name || '', date: frDate(today()), montant: dh(st.balance),
    total_facture: dh(st.totalInvoiced), total_regle: dh(st.totalPaid),
    societe: company?.name || '', telephone_societe: company?.phone || ''
  });
}


/* ---------- V49 : catalogue des droits ----------
   Chaque droit : code, libellé FR/AR, aide FR/AR, fonction (activable pour toute la droguerie). */
const PD = (code, fr, ar, dfr = '', dar = '', feature = null) => ({ code, fr, ar, dfr, dar, feature });
const PERM_MODULES = [
  { key: 'dashboard', fr: 'Tableau de bord et analyses', ar: 'لوحة التحكم والتحليلات', icon: '📊', perms: [
    PD('dashboard.read', 'Consulter le tableau de bord', 'الاطلاع على لوحة التحكم', 'Indicateurs du jour, alertes, activité récente.', 'مؤشرات اليوم والتنبيهات وآخر العمليات.'),
    PD('reporting.read', 'Reporting', 'التقارير', 'CA, encaissements, dettes et marges par vendeur ; relevés clients.', 'رقم المعاملات والتحصيل والديون والهوامش حسب البائع؛ كشوف الحساب.'),
    PD('profit.read', 'Centre de rentabilité', 'مركز الربحية', 'Marges par produit, prix conseillés, stock dormant.', 'الهوامش حسب المنتج، الأثمنة المقترحة، المخزون الراكد.', 'profit'),
    PD('tools.read', 'Outils et calculateurs', 'الأدوات والحاسبات', 'Calculatrice, calcul de marge et de prix de vente.', 'آلة حاسبة، حساب الهامش وثمن البيع.', 'tools'),
    PD('data.export', 'Exporter les données (Excel / CSV)', 'تصدير البيانات (Excel / CSV)', 'Boutons « Excel / CSV » des listes, du reporting et des sauvegardes Excel.', 'أزرار « Excel / CSV » في اللوائح والتقارير.')
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

// V53 : un client / fournisseur peut être commun à plusieurs drogueries.
// branch_ids vide (ou absent après la MAJ) = toutes les drogueries ; avant la MAJ V53 : sa droguerie (branch_id).
function partyBranchIds(p) {
  if (!p) return [];
  if (Array.isArray(p.branch_ids)) return p.branch_ids.map(Number).filter(Boolean);
  if (p.branch_ids === undefined && p.branch_id) return [Number(p.branch_id)];
  return [];
}
function partyInBranch(p, bId) {
  if (!bId) return true;
  const ids = partyBranchIds(p);
  return !ids.length || ids.includes(Number(bId));
}
function isWalkInParty(p) { return !!p?.is_walk_in; }

function canSeePartyRecord(record, type, session = getStoredSession()) {
  if (isAdmin(session)) return true;
  if (!partyInBranch(record, branchId(session))) return false;
  if (isManager(session)) return true;

  if (type === 'clients') {
    // Vendeur : son portefeuille, plus la fiche comptoir de sa droguerie
    return isWalkInParty(record)
      || Number(record.assigned_to || 0) === Number(session?.user?.id || 0)
      || Number(record.created_by || 0) === Number(session?.user?.id || 0);
  }

  return true;
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

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
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

// V52 : export produits réimportable (mêmes en-têtes que le modèle d'import Excel)
function productsExportSpec(L, rows, title) {
  return {
    fileName: 'Produits', title: title || L('products'),
    sheets: [{
      name: L('products'),
      note: 'Fichier modifiable puis réimportable : Produits → Import Excel (même référence = mise à jour).'
        + (new Set((rows || []).map(p => p.branchName || '')).size > 1 ? ' Plusieurs drogueries : pour réimporter, exportez une droguerie à la fois (filtre droguerie).' : ''),
      columns: [
        { key: 'ref', header: 'Référence' }, { key: 'nom', header: 'Désignation' }, { key: 'nomAr', header: 'Nom arabe' },
        { key: 'categorie', header: 'Catégorie' }, { key: 'unite', header: 'Unité' },
        { key: 'prixVente', header: 'Prix vente TTC (détail)', type: 'money', total: false },
        { key: 'prixGros', header: 'Prix vente TTC (gros)', type: 'money', total: false },
        { key: 'barcode', header: 'Code-barres' }, { key: 'stockMin', header: 'Stock minimum', type: 'qty' },
        { key: 'quantite', header: 'Stock', type: 'qty', total: true },
        { key: 'prixAchat', header: 'Coût unitaire HT (PMP)', type: 'money', total: false },
        { value: p => Number(p.quantite || 0) * Number(p.prixAchat || 0), header: 'Valeur stock (PMP)', type: 'money', total: true },
        { key: 'datePeremption', header: 'Date péremption (AAAA-MM-JJ)', type: 'date' },
        { key: 'branchName', header: 'Droguerie' }
      ],
      rows
    }]
  };
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
    if (error) {
      // V57 : maintenance / abonnement suspendu ou expiré → message du serveur
      if (/maintenance|abonnement|accès suspendu/i.test(error.message || '')) throw new Error(error.message);
      throw new Error(/mot de passe/i.test(error.message) ? 'Mot de passe incorrect' : 'Identifiant incorrect');
    }
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
  const defaults = { vat_rate: '20', theme: 'light', company_name: 'DrogueriePro', company_ice: '', company_phone: '', company_address: '', company_rc: '', company_if: '', company_patente: '', company_cnss: '',
    company_email: '', company_website: '', company_rib: '',
    brand_logo: '', brand_primary: BRAND_DEFAULTS.primary, brand_accent: BRAND_DEFAULTS.accent, brand_slogan: '', brand_doc_footer: '', brand_ticket_message: '', brand_ticket_logo: '1', brand_apply_app: '1',
    wa_default_lang: '', wa_link_days: '30', ...ALERT_DEFAULTS };
  const { data, error } = await supabase.from('app_settings').select('*');
  if (error) return defaults;
  const out = { ...defaults };
  (data || []).forEach(x => { out[x.key] = x.value; });
  cacheAlertSettings(out);
  cacheWaSettings(out);
  setBrandCache(brandFromSettings(out));
  return out;
}

async function saveSettings(settings) {
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value: String(value ?? '') }));
  const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'key' });
  if (error) throw new Error(error.message);
  cacheAlertSettings(settings);
  cacheWaSettings(settings);
  setBrandCache(brandFromSettings(settings));
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
    cnss: s.company_cnss || '',
    email: s.company_email || '',
    website: s.company_website || '',
    rib: s.company_rib || '',
    ...(({ logo, primary, accent, slogan, docFooter, ticketMessage, ticketLogo }) => ({ logo, primary, accent, slogan, docFooter, ticketMessage, ticketLogo }))(brandFromSettings(s))
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
  // V52 : commande entièrement livrée / reçue (par des BL / BR liés) = soldée
  if (doc.stage === 'commande' && rem <= 0.0001 && Number(doc.qty_done || 0) > 0) return 'closed';
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
    const editedPrice = l.prixUnitEdit !== undefined && l.prixUnitEdit !== null && String(l.prixUnitEdit).trim() !== '' ? Number(l.prixUnitEdit) : null;
    byKey[key] = {
      excluded: !!l.excluded,
      qty: Number(l.qteToProcess ?? l.qte ?? 0),
      price: editedPrice !== null && Number.isFinite(editedPrice) && editedPrice >= 0 ? editedPrice : null
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
      ...(inputLine.price !== null ? { prixUnit: inputLine.price } : {}),
      prixUnitEdit: undefined,
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

// V52 : colonnes facultatives des achats (N° BL / facture fournisseur, échéance).
// Tant que MAJ_V52 n'est pas exécuté, l'enregistrement se fait sans elles.
const PURCHASE_OPTIONAL_COLS = ['supplier_ref', 'due_date'];
function purchaseExtraFields(body = {}) {
  const out = {};
  if (String(body.supplierRef || '').trim()) out.supplier_ref = String(body.supplierRef).trim().slice(0, 80);
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(body.dueDate || ''))) out.due_date = body.dueDate;
  return out;
}
function isOptionalColError(error) {
  return !!error && PURCHASE_OPTIONAL_COLS.some(c => String(error.message || '').includes(c));
}
function withoutOptionalCols(payload) {
  const p = { ...payload }; PURCHASE_OPTIONAL_COLS.forEach(c => { delete p[c]; }); return p;
}
async function insertDocRow(type, payload, wantId = false) {
  const run = pl => (wantId ? supabase.from(type).insert(pl).select('id').single() : supabase.from(type).insert(pl));
  let r = await run(payload);
  if (r.error && isOptionalColError(r.error)) r = await run(withoutOptionalCols(payload));
  if (r.error) throw new Error(r.error.message);
  return r.data;
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
    branch_id: isAdmin(session) ? (body.branchId || branchId(session)) : branchId(session),
    ...purchaseExtraFields(body)
  };

  const created = await insertDocRow(type, payload, true);
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

// V53 : encours de tous les clients / fournisseurs, par droguerie (toutes drogueries, même pour un utilisateur de filiale)
async function loadPartyBalances(type) {
  const { data, error } = await supabase.rpc('app_party_balances', { p_type: type });
  if (error) return null;
  const m = {};
  (data || []).forEach(r => {
    const k = String(r.party_id);
    const e = m[k] || (m[k] = { invoiced: 0, paid: 0, outstanding: 0, docs: 0, byBranch: [] });
    e.invoiced += Number(r.invoiced || 0); e.paid += Number(r.paid || 0); e.outstanding += Number(r.outstanding || 0); e.docs += Number(r.docs || 0);
    e.byBranch.push({ branchId: r.branch_id, outstanding: Number(r.outstanding || 0), invoiced: Number(r.invoiced || 0) });
  });
  return m;
}

async function clientOutstanding(clientId) {
  const { data: rpc, error: rpcErr } = await supabase.rpc('app_party_balances', { p_type: 'clients' });
  if (!rpcErr && Array.isArray(rpc)) return rpc.filter(r => String(r.party_id) === String(clientId)).reduce((t, r) => t + Number(r.outstanding || 0), 0);
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
    if (body.supplierRef !== undefined) payload.supplier_ref = String(body.supplierRef || '').trim() || null;
    if (body.dueDate !== undefined) payload.due_date = /^\d{4}-\d{2}-\d{2}$/.test(String(body.dueDate || '')) ? body.dueDate : null;
  }

  let { error } = await supabase.from(type).update(payload).eq('id', id);
  if (error && isOptionalColError(error)) ({ error } = await supabase.from(type).update(withoutOptionalCols(payload)).eq('id', id));
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
    : { ...common, supplier_id: doc.supplier_id, supplier_name: doc.supplier_name, received: false, ...purchaseExtraFields(body) };
  if (doc.trip_id && isSales) payload.trip_id = doc.trip_id;

  await insertDocRow(type, payload);

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
    payments.push({ id: 'AV' + Date.now(), canceled: false, canceledAt: '', canceledBy: '', cancelReason: '', date: body.date || today(), mode: 'Avoir', montant: Number(imputed.toFixed(2)), avoirNumber: number, note: (isSales ? 'Avoir ' : 'Retour ') + number,
      createdBy: session?.user?.id || null, createdByLabel: currentUserLabel() || '', createdAt: new Date().toISOString() });
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

  // V52 : commande déjà partiellement livrée / reçue → on crée un BL / BR lié pour le reste
  // (avant : la commande entière devenait un BL / BR et pouvait être facturée deux fois)
  if ((next === 'livraison' || next === 'reception') && processedTotal(processedLines(doc)) > 0.0001) {
    await partialDoc(type, doc.id, { date: opts.date || today(), supplierRef: opts.supplierRef, lignes: remainingLines.map(l => ({ ...l, qteToProcess: Number(l.remainingQty || 0), excluded: false })) });
    return;
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
  const payer = getStoredSession();
  payments.push({
    id: String(Date.now()), canceled: false, canceledAt: '', canceledBy: '', cancelReason: '', date: body.date || today(), mode: body.mode || 'Espèces', montant,
    // V55 : auteur et heure du règlement (avant : non enregistrés → « Créé par » vide)
    createdBy: payer?.user?.id || null, createdByLabel: currentUserLabel() || '', createdAt: new Date().toISOString(),
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
    canceledById: session?.user?.id || null,
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
    branch_id: doc.branch_id || branchId(session),
    ...purchaseExtraFields(body)
  };

  await insertDocRow(type, payload);

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
  const [{ data: sales, error: e1 }, { data: purchases, error: e2 }, labels] = await Promise.all([
    applyDocScope(supabase.from('sales').select('*'), 'sales', getStoredSession()).order('id', { ascending: false }),
    applyDocScope(supabase.from('purchases').select('*'), 'purchases', getStoredSession()).order('id', { ascending: false }),
    loadUserLabels()
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  // V55 : « Créé par » = l'auteur du règlement (enregistré depuis la V55, repris du journal pour les anciens).
  // Inconnu : on affiche l'auteur du document, signalé comme tel.
  const author = (p, d) => {
    const label = p.createdByLabel || (p.createdBy ? labels[p.createdBy] : '');
    if (label) return { createdByLabel: label, createdById: p.createdBy || null, authorFromDoc: false };
    return { createdByLabel: labels[d.created_by] || d.created_by_label || '', createdById: d.created_by || null, authorFromDoc: true };
  };
  const map = (d, type, table) => jsonValue(d.payments_json, []).map(p => ({
    type, sourceTable: table, docType: table === 'sales' ? 'vente' : 'achat', docStage: d.stage, docId: d.id, docNumber: docNo(d),
    tiers: table === 'sales' ? d.client_name : d.supplier_name, partyId: table === 'sales' ? d.client_id : d.supplier_id, branchId: d.branch_id,
    ...p, ...author(p, d)
  }));
  const enc = (sales || []).flatMap(d => map(d, 'encaissement', 'sales'));
  const dec = (purchases || []).flatMap(d => map(d, 'decaissement', 'purchases'));
  return [...enc, ...dec].sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.createdAt || b.id || '').localeCompare(String(a.createdAt || a.id || '')));
}

async function loadParties(type, opts = {}) {
  const session = getStoredSession();
  const { data, error } = await supabase.from(type).select('*').order('name');
  if (error) throw new Error(error.message);
  // V53 : fiches communes à plusieurs drogueries → filtrage par droguerie sur branch_ids
  const bId = (isAdmin(session) || isSuperAdmin(session)) ? selectedBranchId(session) : branchId(session);
  const labels = await loadUserLabels();
  // V56 : fiches comptoir / fournisseurs divers masquées dans les listes pour les profils autres que l'administrateur
  const hideWalkIns = opts.list && !(isAdmin(session) || isSuperAdmin(session));
  return enrichParties((data || []).filter(x => partyInBranch(x, bId) && canSeePartyRecord(x, type, session) && !(hideWalkIns && x.is_walk_in)), labels)
    .sort((a, b) => Number(!!b.is_walk_in) - Number(!!a.is_walk_in));
}

async function saveParty(type, body) {
  const writePerm = type === 'clients' ? 'clients.write' : 'suppliers.write';
  requirePerm(writePerm, type === 'clients' ? 'Gestion clients' : 'Gestion fournisseurs');

  const session = getStoredSession();
  if (body.is_walk_in && !isAdmin(session)) throw new Error(Lc('wiAdminOnly'));
  const common = {
    name: body.name || '',
    ice: body.ice || '',
    phone: body.phone || '',
    city: body.city || '',
    address: body.address || '',
    assigned_to: type === 'clients' && !body.is_walk_in ? (body.assigned_to || body.assignedTo || session?.user?.id || null) : null
  };
  // Droguerie d'origine : fixée à la création (l'administrateur peut la changer)
  if (!body.id) common.branch_id = isAdmin(session) ? (body.branch_id || body.branchId || branchId(session)) : branchId(session);
  else if (isAdmin(session) && (body.branch_id || body.branchId)) common.branch_id = body.branch_id || body.branchId;
  // V53 : drogueries où la fiche est utilisable (vide = toutes)
  if (body.branch_ids !== undefined && !body.is_walk_in) {
    const ids = Array.isArray(body.branch_ids) ? [...new Set(body.branch_ids.map(Number).filter(Boolean))] : [];
    common.branch_ids = ids.length ? ids : null;
  }

  if (!body.id) {
    common.created_by = session?.user?.id || null;
    common.created_by_label = currentUserLabel();
  }

  const payload = type === 'clients'
    ? { ...common, type: body.type || 'entreprise', price_tier: body.price_tier === 'gros' ? 'gros' : 'detail', credit_limit: Math.max(0, Number(body.credit_limit || 0)) }
    : { ...common, contact: body.contact || '' };
  // V56 : case « Comptoir » (visible dans la caisse rapide) — modifiable par l'administrateur seulement
  if (type === 'clients' && !body.is_walk_in && isAdmin(session) && body.pos_visible !== undefined) payload.pos_visible = body.pos_visible !== false;

  const run = pl => (body.id ? supabase.from(type).update(pl).eq('id', body.id) : supabase.from(type).insert(pl).select('id').single());
  let { data, error } = await run(payload);
  if (error && /branch_ids|is_walk_in|pos_visible/.test(error.message || '')) { const pl = { ...payload }; delete pl.branch_ids; delete pl.pos_visible; ({ data, error } = await run(pl)); }
  if (error) throw new Error(error.message);

  await auditLog(type === 'clients' ? 'Clients' : 'Fournisseurs', body.id ? 'UPDATE' : 'CREATE', payload.name, body.id ? 'Modification tiers' : 'Création tiers');
  return body.id || data?.id;
}
async function deleteParty(type, id) {
  const delPerm = type === 'clients' ? 'clients.delete' : 'suppliers.delete';
  requirePerm(delPerm, type === 'clients' ? 'Suppression client' : 'Suppression fournisseur');

  const { data: row } = await supabase.from(type).select('*').eq('id', id).maybeSingle();
  if (row?.is_walk_in) {
    // V56 : seule une fiche comptoir supplémentaire (pas celle par défaut de la droguerie) peut être supprimée, par l'administrateur
    if (!isAdmin(getStoredSession())) throw new Error(Lc('wiAdminOnly'));
    const { data: same } = await supabase.from(type).select('id').eq('is_walk_in', true).eq('branch_id', row.branch_id).order('id');
    if (!same || !same.length || Number(same[0].id) === Number(row.id)) throw new Error(Lc('pWalkInHint'));
  }
  const docTable = type === 'clients' ? 'sales' : 'purchases';
  const { count } = await supabase.from(docTable).select('id', { count: 'exact', head: true }).eq(type === 'clients' ? 'client_id' : 'supplier_id', id);
  if (count) throw new Error(Lc('pHasDocs'));
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
  const [maint, setMaint] = useState(null);
  const brand = useBrand();
  useEffect(() => {
    // V57 : maintenance annoncée sur l'écran de connexion
    supabase.rpc('app_saas_public').then(({ data }) => { if (data?.maintenance) setMaint(data); }).catch(() => {});
    loadPublicBranding().then(d => {
      if (d) setBrandCache({ ...getBrand(), ...(({ logo, primary, accent, slogan, name }) => ({ logo, primary, accent, slogan, name }))(brandFromSettings(d)) });
    });
  }, []);

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
    <div className={'min-h-screen grid place-items-center login-bg ' + (lang === 'ar' ? 'rtl ' : '') + (brand.applyApp ? 'brand-app' : '')}>
      <form onSubmit={submit} className="bg-white p-7 rounded-2xl w-full max-w-sm shadow-2xl login-card">
        {brand.logo ? (
          <div className="text-center mb-5">
            <img src={brand.logo} alt="" className="login-logo" />
            {brand.name ? <h1 className="font-bold text-lg mt-2">{brand.name}</h1> : null}
            {brand.slogan ? <p className="text-xs text-slate-500">{brand.slogan}</p> : null}
            <p className="text-xs text-slate-400 mt-1">{L('login')} · DrogueriePro</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-5">
            <span className="bg-amber-500 rounded-xl w-12 h-12 grid place-items-center font-black">DP</span>
            <div>
              <h1 className="font-bold text-xl">{brand.name || 'DrogueriePro'}</h1>
              <p className="text-xs text-slate-400">{L('login')}{brand.name ? ' · DrogueriePro' : ''}</p>
            </div>
          </div>
        )}

        {maint && !/maintenance/i.test(err) ? <p className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded mb-3 text-sm" data-login-maint>🛠 {tx('Maintenance en cours', 'صيانة جارية')}{maint.message ? ' : ' + maint.message : ''}</p> : null}
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

const MENU_GROUPS = [
  { key: 'home', items: ['dashboard'] },
  { key: 'sales', items: ['pos', 'sales', 'clients'] },
  { key: 'purchases', items: ['purchases', 'suppliers'] },
  { key: 'stock', items: ['products', 'stockMoves'] },
  { key: 'finance', items: ['payments', 'expenses', 'reporting', 'profit', 'tools'] },
  { key: 'admin', items: ['settings', 'permissions', 'branches', 'users', 'mobileApp', 'backup', 'saas'] }
];
const MENU_ICONS = {
  dashboard: '🏠', pos: '🛒', sales: '🧾', clients: '👥', purchases: '📦', suppliers: '🚚', products: '🏷️', stockMoves: '🔄',
  payments: '💳', expenses: '⛽', reporting: '📈', profit: '💹', tools: '🧮', settings: '⚙️', permissions: '🔐', branches: '🏬',
  users: '👤', mobileApp: '📱', backup: '🗄️', saas: '☁️'
};

function Layout({ L, lang, toggleLang, session, setSession }) {
  const defaultPage = isSuperAdmin(session) ? 'saas' : 'dashboard';
  const [page, setPageState] = useState(() => { try { return localStorage.getItem('droguerie_last_page') || defaultPage; } catch { return defaultPage; } });
  const [disabledModules, setDisabledModules] = useState(getDisabledModulesCache());
  const [globalBranchFilter, setGlobalBranchFilter] = useState(getSelectedBranchFilter());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [menuQ, setMenuQ] = useState('');
  const [collapsed, setCollapsed] = useState(() => { try { return JSON.parse(localStorage.getItem('droguerie_menu_collapsed') || '{}'); } catch { return {}; } });
  const [palette, setPalette] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [pageKey, setPageKey] = useState(0);
  const brand = useBrand();
  useEffect(() => { loadSettings().catch(() => null); }, []);

  function setPage(p) {
    setPageState(p);
    setPageKey(k => k + 1);
    try { localStorage.setItem('droguerie_last_page', p); } catch {}
    setMobileMenuOpen(false);
    try { window.scrollTo(0, 0); } catch {}
  }

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
      setPageState(visible[0]?.[0] || defaultPage);
    }
  }, [disabledModules, session, page]);

  const visibleItems = items.filter(item => visibleMenuItem(item, session, disabledModules));
  const byKey = Object.fromEntries(visibleItems.map(x => [x[0], x]));
  const groups = MENU_GROUPS.map(g => ({ ...g, items: g.items.map(k => byKey[k]).filter(Boolean) })).filter(g => g.items.length);
  const grouped = new Set(MENU_GROUPS.flatMap(g => g.items));
  const others = visibleItems.filter(x => !grouped.has(x[0]));
  if (others.length) groups.push({ key: 'admin', items: others });

  // Actions « + Nouveau » selon les droits
  const newActions = [
    byKey.pos && { key: 'pos', icon: '🛒', label: L('uxOpenPos'), run: () => setPage('pos') },
    byKey.sales && can('sales.write') && { key: 'sale', icon: '🧾', label: L('uxNewSale'), run: () => { queueQuickAction('sales', 'devis'); setPage('sales'); } },
    byKey.sales && can('sales.write') && { key: 'inv', icon: '⚡', label: L('uxNewInvoice'), run: () => { queueQuickAction('sales', 'facture'); setPage('sales'); } },
    byKey.purchases && can('purchases.write') && { key: 'po', icon: '📦', label: L('uxNewPurchase'), run: () => { queueQuickAction('purchases', 'commande'); setPage('purchases'); } },
    byKey.purchases && can('purchases.write') && { key: 'rc', icon: '📥', label: L('uxNewReceipt'), run: () => { queueQuickAction('purchases', 'reception'); setPage('purchases'); } },
    byKey.clients && can('clients.write') && { key: 'cl', icon: '👥', label: L('uxNewClient'), run: () => { queueQuickAction('clients', 'new'); setPage('clients'); } },
    byKey.suppliers && can('suppliers.write') && { key: 'su', icon: '🚚', label: L('uxNewSupplier'), run: () => { queueQuickAction('suppliers', 'new'); setPage('suppliers'); } },
    byKey.products && can('products.write') && { key: 'pr', icon: '🏷️', label: L('uxNewProduct'), run: () => { queueQuickAction('products', 'new'); setPage('products'); } }
  ].filter(Boolean);

  // Raccourcis clavier globaux
  useEffect(() => {
    const h = e => {
      const k = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'k') { e.preventDefault(); setPalette(true); return; }
      if (e.altKey && k === 'n') { e.preventDefault(); setNewOpen(o => !o); return; }
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement?.tagName || '')) {
        const f = document.querySelector('[data-list-search]') || document.querySelector('main input[type=text], main input:not([type])');
        if (f) { e.preventDefault(); f.focus(); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const q = normSearch(menuQ).trim();
  const toggleGroup = key => { const c = { ...collapsed, [key]: !collapsed[key] }; setCollapsed(c); try { localStorage.setItem('droguerie_menu_collapsed', JSON.stringify(c)); } catch {} };
  const bottom = ['dashboard', 'pos', 'sales', 'clients'].map(k => byKey[k]).filter(Boolean).slice(0, 4);

  return (
    <div className={(lang === 'ar' ? 'rtl ' : '') + (brand.applyApp ? 'brand-app' : '')}>
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label={L('uxMenu')}>☰</button>
        <div className="font-bold flex items-center gap-2">
          {brand.logo ? <img src={brand.logo} alt="" className="topbar-logo" /> : null}
          {brand.name ? <span>{brand.name}</span> : <span>Droguerie<span className="text-amber-500">Pro</span></span>}
        </div>
        <div className="flex gap-1">
          <button className="mobile-menu-btn" onClick={() => setPalette(true)} aria-label={L('uxPalette')}>🔎</button>
          <button className="mobile-menu-btn" onClick={toggleLang}>{lang === 'fr' ? 'ع' : 'Fr'}</button>
        </div>
      </div>
      {mobileMenuOpen ? <div className="mobile-backdrop" onClick={() => setMobileMenuOpen(false)} /> : null}
      <div className="min-h-screen flex app-shell">
        <aside className={'w-64 bg-slate-900 text-slate-300 flex flex-col app-sidebar ' + (mobileMenuOpen ? 'open' : '')}>
          <div className="p-5 border-b border-slate-800">
            {brand.logo ? <div className="sidebar-logo"><img src={brand.logo} alt="" /></div> : null}
            {brand.name ? (
              <>
                <div className="text-lg font-black text-white leading-tight">{brand.name}</div>
                <div className="text-[10px] text-slate-400">{L('poweredBy')}</div>
              </>
            ) : <div className="text-xl font-black text-white">Droguerie<span className="text-amber-500">Pro</span></div>}
            <div className="text-xs text-slate-400 mt-1">{session.user.full_name || session.user.username} · {session.user.role}</div>
          </div>
          <div className="px-3 pt-3">
            <input className="menu-search" placeholder={'🔎 ' + L('uxMenuSearch')} value={menuQ} onChange={e => setMenuQ(e.target.value)} aria-label={L('uxMenuSearch')} />
          </div>
          <nav className="flex-1 p-3 overflow-auto menu-nav" aria-label={L('uxMenu')}>
            {groups.map(g => {
              const list = g.items.filter(it => !q || normSearch(it[1]).includes(q));
              if (!list.length) return null;
              const open = q || !collapsed[g.key] || list.some(it => it[0] === page);
              return (
                <div key={g.key} className="menu-group">
                  {g.key !== 'home' ? (
                    <button type="button" className="menu-group-title" aria-expanded={!!open} onClick={() => toggleGroup(g.key)}>
                      <span>{L('uxGroup_' + g.key)}</span><span aria-hidden="true">{open ? '▾' : '▸'}</span>
                    </button>
                  ) : null}
                  {open ? list.map(item => (
                    <button
                      key={item[0]}
                      onClick={() => setPage(item[0])}
                      aria-current={page === item[0] ? 'page' : undefined}
                      className={'menu-item w-full text-left px-3 py-2 rounded-lg ' + (page === item[0] ? 'bg-amber-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-white')}
                    >
                      <span className="menu-icon" aria-hidden="true">{MENU_ICONS[item[0]] || '•'}</span>{item[1]}
                    </button>
                  )) : null}
                </div>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button className="btn bg-white text-slate-900 w-full" onClick={toggleLang}>{L('lang')}</button>
            <button className="btn bg-slate-800 text-white w-full" onClick={async () => { await refreshCurrentSession(setSession); alert('Droits actualisés'); }}>Rafraîchir droits</button>
            <button className="btn bg-slate-800 text-white w-full" onClick={() => setPwdOpen(true)}>{L('myPassword')}</button>
            <button className="btn bg-red-600 text-white w-full" onClick={async () => { await logoutSession(); setSession(null); }}>{L('logout')}</button>
          </div>
        </aside>
        <main className="flex-1 p-6 max-w-[1500px] mx-auto w-full app-main pro-main">
          <div className="app-topline no-print">
            <BranchFilter L={L} value={globalBranchFilter} onChange={v => { setSelectedBranchFilter(v); setGlobalBranchFilter(v); }} />
            <div className="app-topline-actions">
              <button type="button" className="btn bg-white border palette-btn" onClick={() => setPalette(true)} title={L('uxShortcuts')}>🔎 {L('uxPalette')}</button>
              {newActions.length ? (
                <span className="row-menu">
                  <button type="button" className="btn bg-amber-500 new-btn" aria-expanded={newOpen} onClick={() => setNewOpen(!newOpen)} title="Alt+N">＋ {L('uxNew')}</button>
                  {newOpen ? (
                    <>
                      <span className="new-backdrop" onClick={() => setNewOpen(false)} />
                      <span className="row-menu-pop new-pop" role="menu">
                        {newActions.map(a => <button key={a.key} type="button" role="menuitem" className="row-menu-item" onClick={() => { setNewOpen(false); a.run(); }}>{a.icon} {a.label}</button>)}
                      </span>
                    </>
                  ) : null}
                </span>
              ) : null}
            </div>
          </div>
          <SaasBanner session={session} />
          <div key={page + '-' + globalBranchFilter + '-' + pageKey}>

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
      {bottom.length ? (
        <nav className="bottom-nav no-print" aria-label={L('uxMenu')}>
          {bottom.map(it => (
            <button key={it[0]} type="button" onClick={() => setPage(it[0])} aria-current={page === it[0] ? 'page' : undefined} className={page === it[0] ? 'on' : ''}>
              <span aria-hidden="true">{MENU_ICONS[it[0]]}</span><small>{it[1]}</small>
            </button>
          ))}
          <button type="button" onClick={() => setMobileMenuOpen(true)}><span aria-hidden="true">☰</span><small>{L('uxMenu')}</small></button>
        </nav>
      ) : null}
      {palette ? <CommandPalette L={L} items={visibleItems} actions={newActions} go={setPage} close={() => setPalette(false)} /> : null}
      {pwdOpen ? <ChangePasswordModal L={L} close={() => setPwdOpen(false)} /> : null}
    </div>
  );
}

// V55 : palette « Aller à… » (Ctrl+K) : écrans et actions rapides
function CommandPalette({ L, items, actions, go, close }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const entries = [
    ...items.map(it => ({ key: 'p-' + it[0], icon: MENU_ICONS[it[0]] || '•', label: it[1], hint: L('uxMenu'), run: () => go(it[0]) })),
    ...actions.map(a => ({ key: 'a-' + a.key, icon: '＋', label: a.label, hint: L('uxNew'), run: a.run }))
  ].filter(e => matchSearch(q, [e.label, e.hint]));
  useEffect(() => { setSel(0); }, [q]);
  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(entries.length - 1, s + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    if (e.key === 'Enter' && entries[sel]) { e.preventDefault(); close(); entries[sel].run(); }
  }
  return (
    <Modal title={'🔎 ' + L('uxPalette')} onClose={close}>
      <input autoFocus className="input mb-3" placeholder={L('uxMenuSearch')} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} aria-label={L('uxMenuSearch')} />
      <div className="palette-list" role="listbox">
        {entries.map((e, i) => (
          <button key={e.key} type="button" role="option" aria-selected={i === sel} className={'palette-item ' + (i === sel ? 'on' : '')} onMouseEnter={() => setSel(i)} onClick={() => { close(); e.run(); }}>
            <span>{e.icon} {e.label}</span><small>{e.hint}</small>
          </button>
        ))}
        {!entries.length ? <p className="text-sm text-slate-500 p-3">{L('uxNoResult')}</p> : null}
      </div>
      <p className="text-xs text-slate-400 mt-3">{L('uxShortcuts')}</p>
    </Modal>
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
    <div className="flex justify-between items-end gap-3 mb-5">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <div className="flex gap-2 flex-wrap justify-end">{children}</div>
    </div>
  );
}

function Table({ children }) {
  return <div className="card overflow-x-auto table-wrap"><table className="table w-full">{children}</table></div>;
}

// V55 : Échap ferme la fenêtre du dessus ; bouton de fermeture accessible
const modalStack = [];
function Modal({ title, onClose, children, wide }) {
  const idRef = useRef(Math.random());
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const id = idRef.current;
    modalStack.push(id);
    const h = e => {
      if (e.key !== 'Escape' || modalStack[modalStack.length - 1] !== id) return;
      e.stopPropagation();
      closeRef.current && closeRef.current();
    };
    window.addEventListener('keydown', h);
    return () => { window.removeEventListener('keydown', h); const i = modalStack.indexOf(id); if (i >= 0) modalStack.splice(i, 1); };
  }, []);
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 grid place-items-center p-4 overflow-auto app-modal" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
      <div className={'bg-white rounded-2xl shadow-2xl w-full p-5 modal-panel ' + (wide ? 'max-w-4xl' : 'max-w-lg')}>
        <div className="flex justify-between items-start gap-3 mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Fermer (Échap)" title="Fermer (Échap)">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- V55 : notifications (remplacent les fenêtres d'alerte bloquantes) ---------- */
const TOAST_ERROR_RE = /erreur|error|impossible|refus|non autoris|insuffisant|invalide|obligatoire|dépass|introuvable|échec|failed|incorrect|ne peut|manquant|déjà|interdit|bloqu|incohéren|supérieure|aucun|veuillez|réservé/i;
function showToast(message, kind) {
  try {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;
    let box = document.getElementById('dp-toasts');
    if (!box) { box = document.createElement('div'); box.id = 'dp-toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const text = String(message ?? '');
    const type = kind || (TOAST_ERROR_RE.test(text) ? 'error' : 'success');
    const el = document.createElement('div');
    el.className = 'dp-toast ' + type;
    const span = document.createElement('span'); span.textContent = (type === 'error' ? '⚠ ' : '✔ ') + text;
    const x = document.createElement('button'); x.type = 'button'; x.textContent = '✕'; x.setAttribute('aria-label', 'Fermer');
    x.onclick = () => el.remove();
    el.appendChild(span); el.appendChild(x);
    box.appendChild(el);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(() => el.remove(), type === 'error' ? 9000 : 4000);
  } catch {}
}
try {
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.createElement === 'function' && !window.__dpToasts) {
    window.__dpToasts = true;
    window.nativeAlert = window.alert ? window.alert.bind(window) : null;
    window.alert = msg => showToast(msg);
  }
} catch {}

/* ---------- V55 : actions rapides (« + Nouveau », palette) ---------- */
let pendingQuickAction = null;
function queueQuickAction(page, action) { pendingQuickAction = { page, action, at: Date.now() }; }
function takeQuickAction(page) {
  const a = pendingQuickAction;
  if (a && a.page === page && Date.now() - a.at < 15000) { pendingQuickAction = null; return a.action; }
  return null;
}

/* ===================== V55 : briques d'ergonomie communes ===================== */
// Période : presets + dates libres
function periodRange(preset) {
  const d = new Date(), iso = x => x.toISOString().slice(0, 10);
  if (preset === 'today') return [today(), today()];
  if (preset === 'week') { const f = new Date(d); f.setDate(d.getDate() - 6); return [iso(f), today()]; }
  if (preset === 'month') return [today().slice(0, 8) + '01', today()];
  return ['', ''];
}
function inPeriod(date, from, to) {
  const v = String(date || '').slice(0, 10);
  if (!v) return !from && !to;
  return (!from || v >= from) && (!to || v <= to);
}
function normSearch(v) { return String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function matchSearch(q, parts) { const n = normSearch(q).trim(); if (!n) return true; const hay = normSearch(parts.filter(x => x !== null && x !== undefined).join(' ')); return n.split(/\s+/).every(w => hay.includes(w)); }

// Barre de filtres : recherche + période (+ filtres propres à l'écran en enfants)
function ListToolbar({ L, search, setSearch, from, to, setPeriod, children, count, total, onReset }) {
  const presets = [['today', L('uxToday')], ['week', L('uxWeek')], ['month', L('uxMonth')], ['all', L('uxAll')]];
  const active = presets.find(([k]) => { const [f, t] = periodRange(k); return f === (from || '') && t === (to || ''); })?.[0];
  return (
    <div className="list-toolbar card p-3 mb-3">
      {setSearch ? <input className="input list-search" data-list-search placeholder={'🔎 ' + L('uxSearch')} value={search} onChange={e => setSearch(e.target.value)} /> : null}
      {setPeriod ? (
        <div className="flex flex-wrap items-center gap-1">
          {presets.map(([k, t]) => <button key={k} type="button" onClick={() => setPeriod(...periodRange(k))} className={'chip ' + (active === k ? 'chip-on' : '')}>{t}</button>)}
          <input type="date" className="input list-date" aria-label={L('dateFrom')} value={from || ''} onChange={e => setPeriod(e.target.value, to)} />
          <span className="text-slate-400 text-xs">→</span>
          <input type="date" className="input list-date" aria-label={L('dateTo')} value={to || ''} onChange={e => setPeriod(from, e.target.value)} />
        </div>
      ) : null}
      {children}
      <div className="list-count">
        {count !== undefined ? <span>{count}{total !== undefined && total !== count ? ' / ' + total : ''}</span> : null}
        {onReset ? <button type="button" onClick={onReset} className="text-xs text-sky-700 underline">{L('uxReset')}</button> : null}
      </div>
    </div>
  );
}

// Affichage progressif des longues listes
function useShowMore(list, step = 50) {
  const [n, setN] = useState(step);
  useEffect(() => { setN(step); }, [list.length]);
  return [list.slice(0, n), list.length > n ? () => setN(n + step) : null];
}
function ShowMore({ L, more, shown, total }) {
  if (!more) return null;
  return <div className="text-center my-3"><button type="button" onClick={more} className="btn bg-white border">{L('uxShowMore')} ({shown} / {total} {L('uxShown')})</button></div>;
}

// Menu « ⋯ » d'actions secondaires d'une ligne
function RowMenu({ L, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [open]);
  const list = (items || []).filter(x => x && !x.hidden);
  if (!list.length) return null;
  return (
    <span className="row-menu" ref={ref}>
      <button type="button" className="btn bg-white border row-menu-btn" aria-label={L('uxMore')} aria-expanded={open} onClick={e => { e.stopPropagation(); setOpen(!open); }}>⋯</button>
      {open ? (
        <span className="row-menu-pop" role="menu">
          {list.map((x, i) => (
            <button key={i} type="button" role="menuitem" className={'row-menu-item ' + (x.tone === 'danger' ? 'danger' : '')} onClick={e => { e.stopPropagation(); setOpen(false); x.onClick(); }}>{x.icon ? x.icon + ' ' : ''}{x.label}</button>
          ))}
        </span>
      ) : null}
    </span>
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
        <ExportButtons L={L} label={L('exportReport') || L('exportExcel')} spec={() => {
          const sellerCols = [
            { key: 'name', header: L('seller') }, { key: 'docs', header: L('documentsCount'), type: 'int', total: true },
            { key: 'total', header: L('turnover'), type: 'money' }, { key: 'paid', header: L('collected'), type: 'money' },
            { key: 'debt', header: L('outstanding'), type: 'money' }, { key: 'margin', header: L('margin'), type: 'money' }
          ];
          const debtCols = [
            { key: 'name', header: L('name') }, { key: 'total', header: L('totalDebt') || 'Total', type: 'money' },
            { key: 'due0_30', header: '0-30', type: 'money' }, { key: 'due31_60', header: '31-60', type: 'money' },
            { key: 'due61_90', header: '61-90', type: 'money' }, { key: 'due90p', header: '+90', type: 'money' },
            { key: 'docs', header: 'Docs', type: 'int', total: true }
          ];
          return {
            fileName: 'Reporting', title: L('reporting'),
            period: dateFrom || dateTo ? (frDate(dateFrom) || '…') + ' → ' + (frDate(dateTo) || '…') : L('allPeriod'),
            sheets: [
              { name: L('salesBySeller'), columns: sellerCols, rows: salesBySeller },
              { name: L('debtBySeller'), columns: sellerCols, rows: debtBySeller },
              { name: L('customerDebts'), columns: debtCols, rows: clientDebts },
              { name: L('supplierDebts'), columns: debtCols, rows: supplierDebts },
              { name: L('expensesMod'), columns: [
                { key: 'num_dep', header: L('tripNum') }, { key: 'date', header: L('date'), type: 'date' }, { key: 'label', header: L('tripLabel') },
                { key: 'manager', header: L('manager2') }, { key: 'grossMargin', header: L('grossMarginLbl'), type: 'money' },
                { key: 'charges', header: L('totalCharges'), type: 'money' }, { key: 'net', header: L('netMargin'), type: 'money' }
              ], rows: tripRows }
            ]
          };
        }} />
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
    events.push({ date: d.date || '', ref: docNo(d), kind: 'facture', debit: Number(d.totalTTC || 0), credit: 0, branchId: d.branch_id });
    (d.paiements || jsonValue(d.payments_json, [])).filter(p => !p.canceled).forEach(p => {
      events.push({ date: p.date || d.date || '', ref: docNo(d), kind: p.mode || 'règlement', debit: 0, credit: Number(p.montant || 0), branchId: d.branch_id });
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
  const [company, setCompany] = useState(null);
  const [phone, setPhone] = useState('');
  const [wa, setWa] = useState(false);
  const [busy, setBusy] = useState(false);
  const [branchNames, setBranchNames] = useState({});
  const ref = useRef(null);
  const table = type === 'clients' ? 'clients' : 'suppliers';
  useEffect(() => { loadBranches().then(bs => setBranchNames(Object.fromEntries(bs.map(b => [b.id, b.name])))).catch(() => {}); }, []);
  const numericId = /^\d+$/.test(String(party.id || ''));
  useEffect(() => {
    loadCompanySettings().then(setCompany).catch(() => setCompany({ name: 'DrogueriePro' }));
    if (numericId) supabase.from(table).select('phone').eq('id', party.id).maybeSingle().then(({ data }) => setPhone(data?.phone || ''));
  }, []);
  const c = company || { name: getBrand().name || 'DrogueriePro', logo: getBrand().logo };
  async function pdf() {
    setBusy(true);
    try { downloadBlobFile(await elementToPdfBlob(ref.current), storageSafe(L('statement') + '_' + party.name) + '.pdf'); }
    catch (e) { alert(e.message); }
    setBusy(false);
  }
  return (
    <Modal title={L('statement') + ' — ' + party.name} onClose={close} wide>
      <StatementDocument L={L} company={c} party={party} st={st} docRef={ref} branchNames={branchNames} />
      <div className="flex flex-wrap justify-end gap-2 mt-4 no-print">
        <ExportButtons L={L} spec={() => ({
          fileName: 'Releve_' + storageSafe(party.name), title: L('statement') + ' — ' + party.name,
          sheets: [{ name: L('statement'), columns: [
            { key: 'date', header: L('date'), type: 'date' }, { key: 'ref', header: L('ref') }, { key: 'kind', header: L('movement') },
            { key: 'debit', header: L('totalInvoiced'), type: 'money' }, { key: 'credit', header: L('totalPaid'), type: 'money' },
            { key: 'balance', header: L('balanceDue'), type: 'money', total: false }
          ], rows: st.lines }]
        })} />
        {featureOn('share') ? <button onClick={() => setWa(true)} className="btn wa-send">🟢 WhatsApp</button> : null}
        <button disabled={busy} onClick={pdf} className="btn bg-white border">{busy ? L('pdfBuilding') : '📄 PDF'}</button>
        <button onClick={() => window.print()} className="btn bg-slate-900 text-white">{L('print')}</button>
        <button onClick={close} className="btn bg-white border">{L('closeBtn')}</button>
      </div>
      {wa ? (
        <WhatsAppModal L={L} kind="statement" close={() => setWa(false)}
          party={{ id: numericId ? party.id : null, name: party.name, phone, table }}
          buildVars={statementVars(party, st, c)} makePdf={() => elementToPdfBlob(ref.current)}
          pdfFolder={'releves_' + table} pdfName={'releve_' + (numericId ? party.id : party.name)}
          auditModule="Reporting" auditObject={L('statement') + ' ' + party.name} />
      ) : null}
    </Modal>
  );
}

// Relance d'un client : factures impayées + relevé en PDF
function ReminderButton({ L, docs, party }) {
  const [open, setOpen] = useState(null);
  async function start() {
    let phone = '';
    if (/^\d+$/.test(String(party.id || ''))) {
      const { data } = await supabase.from('clients').select('phone').eq('id', party.id).maybeSingle();
      phone = data?.phone || '';
    }
    const company = await loadCompanySettings().catch(() => ({ name: 'DrogueriePro' }));
    const bs = await loadBranches().catch(() => []);
    setOpen({ phone, company, branchNames: Object.fromEntries(bs.map(b => [b.id, b.name])) });
  }
  if (!featureOn('share')) return null;
  const unpaid = (docs || []).filter(d => d.stage === 'facture' && String(d.client_id || d.client_name || 'unknown') === String(party.id))
    .map(d => ({ d, rest: Number(d.reste ?? paymentInfo(d).rest ?? 0) })).filter(x => x.rest > 0.009)
    .sort((a, b) => String(a.d.date || '').localeCompare(String(b.d.date || '')));
  const st = buildStatement(docs, 'clients', party.id);
  return (
    <>
      <button onClick={start} className="btn wa-send text-xs" title={L('waReminder')}>🟢 {L('waReminder')}</button>
      {open ? (
        <WhatsAppModal L={L} kind="reminder" close={() => setOpen(null)}
          party={{ id: /^\d+$/.test(String(party.id || '')) ? party.id : null, name: party.name, phone: open.phone, table: 'clients' }}
          buildVars={lang => ({
            client: party.name, date: frDate(today()), montant: dh(unpaid.reduce((s, x) => s + x.rest, 0)),
            factures: unpaid.map(x => '• ' + docNo(x.d) + ' (' + frDate(x.d.date) + ') : ' + dh(x.rest)).join('\n'),
            societe: open.company.name || '', telephone_societe: open.company.phone || ''
          })}
          makePdf={() => jsxToPdfBlob(<StatementDocument L={L} company={open.company} party={party} st={st} branchNames={open.branchNames} />)}
          pdfFolder="releves_clients" pdfName={'releve_' + party.id}
          auditModule="Reporting" auditObject={'Relance ' + party.name} />
      ) : null}
    </>
  );
}

function DebtTable({ L, title, rows, docs, type }) {
  const [stmt, setStmt] = useState(null);
  return (
    <div className="card p-5 overflow-auto">
      <div className="flex justify-between items-center gap-2 mb-4 flex-wrap">
        <h2 className="text-lg font-black">{title}</h2>
        <ExportButtons L={L} spec={() => ({
          fileName: type === 'clients' ? 'Creances_clients' : 'Dettes_fournisseurs', title,
          sheets: [{ name: title, columns: [
            { key: 'name', header: L('name') }, { key: 'total', header: L('totalDebt') || 'Total', type: 'money' },
            { key: 'due0_30', header: '0-30', type: 'money' }, { key: 'due31_60', header: '31-60', type: 'money' },
            { key: 'due61_90', header: '61-90', type: 'money' }, { key: 'due90p', header: '+90', type: 'money' },
            { key: 'docs', header: 'Docs', type: 'int', total: true }
          ], rows }]
        })} />
      </div>
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
              <td className="whitespace-nowrap">
                {docs ? <button onClick={() => setStmt(r)} className="btn bg-white border text-xs">{L('statement')}</button> : null}
                {docs && type === 'clients' && r.total > 0.009 ? <> <ReminderButton L={L} docs={docs} party={r} /></> : null}
              </td>
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
        <ExportButtons L={L} spec={() => ({
          fileName: 'Rentabilite_produits', title: L('profitCenter'),
          sheets: [
            { name: L('profitability'), columns: [
              { key: 'ref', header: L('ref') }, { key: 'nom', header: L('product') }, { key: 'categorie', header: L('category') },
              { key: 'prixAchat', header: L('purchasePrice'), type: 'money', total: false }, { key: 'prixVente', header: L('salePrice'), type: 'money', total: false },
              { value: p => Number(p.prixVente || 0) - Number(p.prixAchat || 0), header: L('margin'), type: 'money', total: false },
              { value: p => (p.prixVente ? ((p.prixVente - p.prixAchat) / p.prixVente) * 100 : 0), header: L('marginRate'), type: 'pct' },
              { key: 'quantite', header: L('stock'), type: 'qty' },
              { value: p => Number(p.quantite || 0) * Number(p.prixAchat || 0), header: L('stockValue'), type: 'money', total: true },
              { value: p => reorderSuggestion(p), header: L('reorderQty'), type: 'qty' }
            ], rows },
            { name: L('profitAlerts'), columns: [
              { key: 'ref', header: L('ref') }, { key: 'nom', header: L('product') },
              { key: 'prixAchat', header: L('purchasePrice'), type: 'money', total: false }, { key: 'prixVente', header: L('salePrice'), type: 'money', total: false },
              { value: p => (p.prixVente ? ((p.prixVente - p.prixAchat) / p.prixVente) * 100 : 0), header: L('marginRate'), type: 'pct' },
              { value: p => suggestSalePrice(p.prixAchat, 25), header: L('minimumSalePrice'), type: 'money', total: false }
            ], rows: lowMargin },
            { name: L('reorderProposal'), columns: [
              { key: 'ref', header: L('ref') }, { key: 'nom', header: L('product') }, { key: 'quantite', header: L('stock'), type: 'qty' },
              { key: 'stockMin', header: L('minStock'), type: 'qty' }, { key: 'reorderQty', header: L('reorderQty'), type: 'qty' },
              { value: p => p.reorderQty * p.prixAchat, header: L('valuation'), type: 'money' }
            ], rows: reorder }
          ]
        })} />
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

  // V52 : classeur Excel, un onglet par table (consultation / analyse). Sans mots de passe ni jetons.
  const excelAll = () => run('xlsx', async () => {
    const data = await serverBackupJson();
    const sheets = Object.entries(data.tables || {})
      .filter(([t, rows]) => !['user_credentials', 'app_sessions'].includes(t) && Array.isArray(rows))
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([table, rows]) => {
        const keys = [...new Set(rows.slice(0, 200).flatMap(r => Object.keys(r || {})))].filter(k => !/password|token|hash|secret/i.test(k));
        const columns = keys.map(k => {
          const sample = rows.map(r => r?.[k]).find(v => v !== null && v !== undefined && v !== '');
          const type = typeof sample === 'number' ? (Number.isInteger(sample) ? 'int' : 'number')
            : typeof sample === 'boolean' ? 'bool'
            : typeof sample === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(sample) ? 'datetime'
            : typeof sample === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sample) ? 'date' : 'text';
          return { key: k, header: k, type, total: false };
        });
        return { name: table, columns, rows, totals: false };
      });
    await exportExcel({ fileName: 'DrogueriePro_Base_complete', title: L('xlFullExport'), sheets });
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
            <div className="card p-5 md:col-span-2 border-emerald-500" style={{ borderWidth: 2 }}>
              <h2 className="font-black mb-1">📊 {L('xlFullExport')}</h2>
              <p className="text-sm text-slate-500">{L('xlFullExportHint')}</p>
              <button disabled={!!busy} onClick={excelAll} className="btn bg-emerald-700 text-white mt-4 w-full">{busy === 'xlsx' ? '…' : L('downloadBackup')}</button>
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

// ===================================================================================
// V57 : console SuperAdmin SaaS (abonnement, formules, modules, usage, maintenance, journal)
// ===================================================================================
const tx = (fr, ar) => (curLang() === 'ar' && ar ? ar : fr);

// Valeurs par défaut si la base n'a pas encore les colonnes V57
const SAAS_MODULE_META = {
  dashboard: { category: 'core', locked: true }, products: { category: 'core', locked: true },
  sales: { requires: ['products', 'clients'] }, purchases: { requires: ['products', 'suppliers'] },
  pos: { requires: ['sales', 'products', 'clients'] }, stockMoves: { requires: ['products'] },
  reporting: { requires: ['sales'] }, profit: { requires: ['sales', 'products'] },
  attachments: { category: 'platform' }, mobileApp: { category: 'platform' }, branches: { category: 'platform' }, users: { category: 'platform' }
};
const SAAS_CATEGORIES = [
  { key: 'core', fr: 'Socle (toujours actif)', ar: 'الأساس (مفعّل دائما)' },
  { key: 'business', fr: 'Modules métier', ar: 'وحدات العمل' },
  { key: 'platform', fr: 'Modules plateforme', ar: 'وحدات المنصة' }
];
const SAAS_STATUS = {
  trial: { fr: 'Essai', ar: 'تجربة', tone: 'blue' },
  active: { fr: 'Actif', ar: 'نشط', tone: 'green' },
  suspended: { fr: 'Suspendu', ar: 'موقوف', tone: 'red' },
  canceled: { fr: 'Résilié', ar: 'ملغى', tone: 'slate' }
};
const SAAS_LIMITS = [
  { key: 'branches', col: 'max_branches', fr: 'Drogueries', ar: 'المحلات', icon: '🏬' },
  { key: 'users', col: 'max_users', fr: 'Utilisateurs actifs', ar: 'المستخدمون النشطون', icon: '👤' },
  { key: 'products', col: 'max_products', fr: 'Produits', ar: 'المنتجات', icon: '🏷️' }
];

function saasModuleMeta(m) {
  const d = SAAS_MODULE_META[m?.code] || {};
  const req = Array.isArray(m?.requires) && m.requires.length ? m.requires : (d.requires || []);
  return { category: m?.category || d.category || 'business', requires: req, locked: m?.locked === true || (m?.locked == null && !!d.locked) };
}

function isoAddPeriod(iso, months) {
  const base = iso && iso > today() ? iso : today();
  const d = new Date(base + 'T12:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}
function daysBetween(fromIso, toIso) {
  if (!fromIso || !toIso) return null;
  return Math.round((new Date(toIso + 'T12:00:00Z') - new Date(fromIso + 'T12:00:00Z')) / 86400000);
}

// Montant de l'abonnement : prix de la formule + modules en option − remise (ou prix forcé)
function saasAmount(control, plans, modules) {
  const c = control || {};
  const yearly = c.billing_cycle === 'yearly';
  const plan = (plans || []).find(p => p.code === c.plan_code);
  const planMods = plan && Array.isArray(plan.modules) ? plan.modules : [];
  const price = m => Number((yearly ? m.yearly_price : m.monthly_price) || 0);
  const enabled = (modules || []).filter(m => m.enabled !== false);
  let base = 0; let addons = [];
  if (plan && planMods.length) {
    base = Number((yearly ? plan.yearly_price : plan.monthly_price) || 0);
    addons = enabled.filter(m => !planMods.includes(m.code) && price(m) > 0);
  } else {
    addons = enabled.filter(m => price(m) > 0);
  }
  const addonsTotal = addons.reduce((t, m) => t + price(m), 0);
  const gross = base + addonsTotal;
  const forced = c.price_override !== null && c.price_override !== undefined && c.price_override !== '';
  const beforeDiscount = forced ? Number(c.price_override || 0) : gross;
  const discount = Math.round(beforeDiscount * Math.min(100, Math.max(0, Number(c.discount_pct || 0)))) / 100;
  return { yearly, base, addons, addonsTotal, gross, forced, discount, total: beforeDiscount - discount, plan };
}

async function loadSaasConsole() {
  const [ctl, plans, modules, state] = await Promise.all([
    supabase.from('saas_control').select('*').eq('id', 1).maybeSingle(),
    supabase.from('saas_plans').select('*').order('sort_order').order('code'),
    loadSaasModules(),
    supabase.rpc('app_saas_state')
  ]);
  const ready = !ctl.error && !plans.error && !state.error;
  return {
    ready,
    error: ready ? '' : (ctl.error || plans.error || state.error)?.message || '',
    control: ctl.data || null,
    plans: plans.data || [],
    modules: (modules || []).map(m => ({ ...m, ...saasModuleMeta(m) })),
    state: state.data || null
  };
}

async function saveSaasControl(patch, what) {
  requirePerm('superadmin.manage', 'Console SaaS');
  const clean = { ...patch };
  delete clean.id; delete clean.updated_at; delete clean.updated_by;
  ['end_date', 'trial_end', 'start_date', 'announcement_from', 'announcement_until'].forEach(k => { if (k in clean && !clean[k]) clean[k] = null; });
  ['max_branches', 'max_users', 'max_products', 'price_override'].forEach(k => { if (k in clean) clean[k] = clean[k] === '' || clean[k] === null || clean[k] === undefined ? null : Number(clean[k]); });
  ['grace_days', 'warn_days', 'discount_pct'].forEach(k => { if (k in clean) clean[k] = Number(clean[k] || 0); });
  const { error } = await supabase.from('saas_control').update(clean).eq('id', 1);
  if (error) throw new Error(error.message);
  await auditLog('SaaS', 'UPDATE', what || 'Abonnement', Object.keys(clean).map(k => k + '=' + (clean[k] === null ? '∅' : String(clean[k]).slice(0, 40))).join(' · ').slice(0, 900));
  window.dispatchEvent(new CustomEvent('droguerie_saas_changed'));
}

async function saveSaasPlan(plan) {
  requirePerm('superadmin.manage', 'Console SaaS');
  const code = String(plan.code || '').trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  if (!code || !String(plan.name || '').trim()) throw new Error(tx('Code et nom obligatoires', 'الرمز والاسم إلزاميان'));
  const num = v => (v === '' || v === null || v === undefined ? null : Number(v));
  const row = {
    code, name: String(plan.name).trim(), description: plan.description || '',
    monthly_price: Number(plan.monthly_price || 0), yearly_price: Number(plan.yearly_price || 0),
    modules: Array.isArray(plan.modules) ? plan.modules : [], max_branches: num(plan.max_branches), max_users: num(plan.max_users), max_products: num(plan.max_products),
    sort_order: Number(plan.sort_order || 0), active: plan.active !== false
  };
  const { error } = await supabase.from('saas_plans').upsert(row, { onConflict: 'code' });
  if (error) throw new Error(error.message);
  await auditLog('SaaS', 'UPDATE', 'Formule ' + row.name, row.modules.length + ' modules · ' + row.monthly_price + ' DH/mois');
  return code;
}

async function deleteSaasPlan(code) {
  requirePerm('superadmin.manage', 'Console SaaS');
  const { error } = await supabase.from('saas_plans').delete().eq('code', code);
  if (error) throw new Error(error.message);
  await auditLog('SaaS', 'DELETE', 'Formule ' + code, '');
}

async function applySaasPlan(code, withLimits) {
  requirePerm('superadmin.manage', 'Console SaaS');
  const { data, error } = await supabase.rpc('app_saas_apply_plan', { p_code: code, p_apply_limits: !!withLimits });
  if (error) throw new Error(error.message);
  const disabled = await refreshSaasModulesCache();
  window.dispatchEvent(new CustomEvent('droguerie_modules_changed', { detail: disabled }));
  window.dispatchEvent(new CustomEvent('droguerie_saas_changed'));
  await auditLog('SaaS', 'UPDATE', 'Formule appliquée : ' + code, (data?.enabled || 0) + ' module(s) activé(s), ' + (data?.disabled || 0) + ' désactivé(s)' + (withLimits ? ', limites de la formule' : ''));
  return data;
}

// Activer / couper un module avec ses dépendances
function saasModuleCascade(modules, code, enable) {
  const byCode = Object.fromEntries(modules.map(m => [m.code, m]));
  const out = new Set();
  if (enable) {
    (function add(c) { (byCode[c]?.requires || []).forEach(r => { if (byCode[r] && byCode[r].enabled === false && !out.has(r)) { out.add(r); add(r); } }); })(code);
  } else {
    let changed = true; const off = new Set([code]);
    while (changed) {
      changed = false;
      modules.forEach(m => { if (m.enabled !== false && !off.has(m.code) && !m.locked && (m.requires || []).some(r => off.has(r))) { off.add(m.code); out.add(m.code); changed = true; } });
    }
  }
  return [...out];
}

function SaasGauge({ label, icon, used, limit }) {
  const has = limit !== null && limit !== undefined;
  const pct = has && Number(limit) > 0 ? Math.min(100, Math.round((Number(used || 0) / Number(limit)) * 100)) : 0;
  const tone = !has ? 'ok' : pct >= 100 ? 'full' : pct >= 80 ? 'near' : 'ok';
  return (
    <div className={'saas-gauge ' + tone} data-gauge={label}>
      <div className="saas-gauge-head"><span>{icon} {label}</span><b>{used ?? 0}{has ? ' / ' + limit : ''}</b></div>
      <div className="saas-gauge-bar"><i style={{ width: (has ? pct : 0) + '%' }} /></div>
      <small>{has ? (pct >= 100 ? tx('Limite atteinte', 'تم بلوغ الحد') : pct + ' %') : tx('Illimité', 'بدون حد')}</small>
    </div>
  );
}

function SuperAdminCenter({ L }) {
  const [tab, setTabState] = useState(() => { try { return localStorage.getItem('dp_saas_tab') || 'overview'; } catch { return 'overview'; } });
  const [data, setData] = useState(null);
  const [stats, setStats] = useState([]);
  const [err, setErr] = useState('');
  const setTab = t => { setTabState(t); try { localStorage.setItem('dp_saas_tab', t); } catch {} };

  async function load() {
    try {
      setErr('');
      const [d, s] = await Promise.all([loadSaasConsole(), loadDbStats()]);
      setData(d);
      setStats(s);
      const disabled = (d.modules || []).filter(x => x.enabled === false).map(x => x.code);
      localStorage.setItem('droguerie_disabled_modules', JSON.stringify(disabled));
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  function exportConfig() {
    const conf = {
      app: 'DrogueriePro', kind: 'saas-config', version: 57, exportedAt: new Date().toISOString(),
      control: data?.control || null, plans: data?.plans || [],
      modules: (data?.modules || []).map(({ code, name, description, enabled, monthly_price, yearly_price, sort_order, category, requires, locked }) => ({ code, name, description, enabled, monthly_price, yearly_price, sort_order, category, requires, locked })),
      featuresOff: getFeaturesOff()
    };
    downloadTextFile('DrogueriePro_config_SaaS_' + today() + '.json', JSON.stringify(conf, null, 2), 'application/json;charset=utf-8');
    auditLog('SaaS', 'EXPORT', 'Configuration SaaS', (conf.plans.length) + ' formules, ' + conf.modules.length + ' modules');
  }

  if (err) return <ErrorBox msg={err} />;
  if (!data) return <p>{tx('Chargement…', 'جار التحميل…')}</p>;

  const tabs = [
    ['overview', '📊', tx('Vue d\'ensemble', 'نظرة عامة')],
    ['subscription', '🧾', tx('Abonnement', 'الاشتراك')],
    ['plans', '📦', tx('Formules', 'الباقات')],
    ['modules', '🧩', tx('Modules', 'الوحدات')],
    ['usage', '📈', tx('Usage', 'الاستعمال')],
    ['maintenance', '🛠', tx('Maintenance & annonces', 'الصيانة والإعلانات')],
    ['journal', '📜', tx('Journal', 'السجل')]
  ];
  const props = { L, data, reload: load, setTab };

  return (
    <>
      <Header title={L('saasCenter')}>
        <button onClick={load} className="btn bg-white border" title={tx('Actualiser', 'تحديث')}>↻</button>
        {data.ready ? <button onClick={exportConfig} className="btn bg-white border" data-saas-export>⬇ {tx('Exporter la configuration', 'تصدير الإعدادات')}</button> : null}
      </Header>

      {!data.ready ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mb-4 text-sm">
          ⚠ {tx('Exécutez MAJ_V57_SUPABASE.sql pour activer l\'abonnement, les formules, les limites et la maintenance. En attendant, seuls les modules et les statistiques sont disponibles.', 'نفّذ MAJ_V57_SUPABASE.sql لتفعيل الاشتراك والباقات والحدود والصيانة.')}
          {data.error ? <div className="text-xs mt-1 font-mono">{data.error}</div> : null}
        </div>
      ) : null}

      <div className="saas-tabs mb-4" role="tablist">
        {tabs.filter(([k]) => data.ready || ['modules', 'usage'].includes(k)).map(([k, icon, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={'saas-tab ' + (tab === k ? 'on' : '')} data-saas-tab={k} onClick={() => setTab(k)}>{icon} {label}</button>
        ))}
      </div>

      {tab === 'overview' && data.ready ? <SaasOverview {...props} /> : null}
      {tab === 'subscription' && data.ready ? <SaasSubscription {...props} /> : null}
      {tab === 'plans' && data.ready ? <SaasPlans {...props} /> : null}
      {(tab === 'modules' || (!data.ready && !['usage'].includes(tab))) ? <SaasModules {...props} /> : null}
      {tab === 'usage' ? <SaasUsage {...props} stats={stats} /> : null}
      {tab === 'maintenance' && data.ready ? <SaasMaintenance {...props} /> : null}
      {tab === 'journal' && data.ready ? <SaasJournal {...props} /> : null}
    </>
  );
}

function SaasStatusBadge({ status }) {
  const s = SAAS_STATUS[status] || SAAS_STATUS.active;
  return <Badge tone={s.tone}>{tx(s.fr, s.ar)}</Badge>;
}

function SaasOverview({ data, reload, setTab }) {
  const c = data.control || {};
  const st = data.state || {};
  const counts = st.counts || {};
  const amount = saasAmount(c, data.plans, data.modules);
  const [busy, setBusy] = useState(false);
  const expiry = st.expiry;
  const daysLeft = st.daysLeft;
  const alerts = [];
  if (c.maintenance) alerts.push(['red', '🛠 ' + tx('Mode maintenance actif : seuls les SuperAdmin peuvent se connecter.', 'وضع الصيانة مفعّل: الدخول للمدير العام فقط.')]);
  if (['suspended', 'canceled'].includes(c.status)) alerts.push(['red', '⛔ ' + tx('Abonnement ' + (c.status === 'suspended' ? 'suspendu' : 'résilié') + (c.on_expiry === 'block' ? ' : connexion bloquée pour les utilisateurs.' : ' : bandeau affiché aux utilisateurs.'), 'الاشتراك موقوف.')]);
  if (st.expired) alerts.push(['red', '⌛ ' + tx('Abonnement expiré le ' + frDate(expiry) + (c.on_expiry === 'block' ? ' · blocage le ' + frDate(st.blockDate) : ' · bandeau seulement'), 'انتهى الاشتراك في ' + frDate(expiry))]);
  else if (daysLeft !== null && daysLeft !== undefined && daysLeft <= Number(c.warn_days || 0)) alerts.push(['amber', '⏳ ' + tx('Échéance dans ' + daysLeft + ' jour(s) (' + frDate(expiry) + ')', 'ينتهي بعد ' + daysLeft + ' يوم')]);
  SAAS_LIMITS.forEach(l => {
    const lim = c[l.col]; const used = Number(counts[l.key] || 0);
    if (lim !== null && lim !== undefined && used >= Number(lim)) alerts.push(['amber', l.icon + ' ' + tx(l.fr + ' : limite atteinte (' + used + ' / ' + lim + ')', l.ar + ': تم بلوغ الحد')]);
  });
  if (st.announcement) alerts.push(['blue', '📣 ' + tx('Annonce en cours : ', 'إعلان جار: ') + st.announcement.text]);
  if (!c.client_name) alerts.push(['slate', '🧾 ' + tx('Fiche client à compléter (onglet Abonnement).', 'أكمل معلومات الزبون.')]);

  async function quick(patch, label) {
    setBusy(true);
    try {
      await saveSaasControl(patch, label);
      if (patch.maintenance === true || (patch.status === 'suspended' && c.on_expiry === 'block')) {
        const { data: n } = await supabase.rpc('app_saas_kick', { p_user: null });
        if (n) showToast(tx(n + ' session(s) fermée(s)', 'تم إغلاق ' + n + ' جلسة'));
      }
      showToast(label);
      await reload();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-5 lg:col-span-2 saas-sub-card" data-saas-summary>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold">{tx('Client', 'الزبون')}</div>
              <div className="text-xl font-black">{c.client_name || tx('Client non renseigné', 'زبون غير محدد')}</div>
              <div className="text-sm text-slate-500">{[c.client_contact, c.client_phone, c.client_email, c.client_city].filter(Boolean).join(' · ') || '—'}</div>
            </div>
            <div className="text-end">
              <SaasStatusBadge status={c.status} />
              <div className="text-sm mt-2">{tx('Formule', 'الباقة')} <b>{amount.plan?.name || c.plan_code}</b></div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div className="saas-fact"><span>{tx('Échéance', 'تاريخ الانتهاء')}</span><b>{expiry ? frDate(expiry) : tx('Sans date de fin', 'بدون تاريخ')}</b><small>{expiry ? (st.expired ? tx('Expiré', 'منتهٍ') : daysLeft + ' ' + tx('jour(s) restant(s)', 'يوم متبقٍ')) : tx('Abonnement ouvert', 'اشتراك مفتوح')}</small></div>
            <div className="saas-fact"><span>{tx('À l\'expiration', 'عند الانتهاء')}</span><b>{c.on_expiry === 'block' ? tx('Blocage', 'حظر') : tx('Bandeau', 'شريط تنبيه')}</b><small>{c.on_expiry === 'block' ? tx('après ' + (c.grace_days || 0) + ' jour(s) de grâce', 'بعد ' + (c.grace_days || 0) + ' يوم سماح') : tx('aucun blocage', 'بدون حظر')}</small></div>
            <div className="saas-fact"><span>{amount.yearly ? tx('Montant annuel', 'المبلغ السنوي') : tx('Montant mensuel', 'المبلغ الشهري')}</span><b>{dh(amount.total)}</b><small>{amount.forced ? tx('prix forcé', 'ثمن محدد') : tx('formule', 'الباقة') + ' ' + fmt(amount.base) + (amount.addons.length ? ' + ' + amount.addons.length + ' ' + tx('option(s)', 'إضافة') : '')}{amount.discount ? ' − ' + fmt(amount.discount) : ''}</small></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button disabled={busy} className="btn bg-white border" data-saas-extend="1" onClick={() => quick({ end_date: isoAddPeriod(c.status === 'trial' ? (c.trial_end || c.end_date) : c.end_date, 1), ...(c.status === 'trial' ? { status: 'active' } : {}) }, tx('Abonnement prolongé d\'un mois', 'تم تمديد الاشتراك شهرا'))}>＋ 1 {tx('mois', 'شهر')}</button>
            <button disabled={busy} className="btn bg-white border" data-saas-extend="12" onClick={() => quick({ end_date: isoAddPeriod(c.status === 'trial' ? (c.trial_end || c.end_date) : c.end_date, 12), ...(c.status === 'trial' ? { status: 'active' } : {}) }, tx('Abonnement prolongé d\'un an', 'تم تمديد الاشتراك سنة'))}>＋ 1 {tx('an', 'سنة')}</button>
            {c.status === 'suspended' || c.status === 'canceled'
              ? <button disabled={busy} className="btn bg-emerald-600 text-white" data-saas-reactivate onClick={() => quick({ status: 'active' }, tx('Abonnement réactivé', 'تمت إعادة التفعيل'))}>▶ {tx('Réactiver', 'إعادة التفعيل')}</button>
              : <button disabled={busy} className="btn bg-white border text-red-600" data-saas-suspend onClick={() => { if (confirm(tx('Suspendre l\'abonnement ?' + (c.on_expiry === 'block' ? ' Les utilisateurs seront déconnectés.' : ''), 'إيقاف الاشتراك؟'))) quick({ status: 'suspended' }, tx('Abonnement suspendu', 'تم إيقاف الاشتراك')); }}>⏸ {tx('Suspendre', 'إيقاف')}</button>}
            <button disabled={busy} className={'btn ' + (c.maintenance ? 'bg-red-600 text-white' : 'bg-white border')} data-saas-maint onClick={() => { if (c.maintenance || confirm(tx('Activer la maintenance ? Les utilisateurs (sauf SuperAdmin) seront déconnectés.', 'تفعيل الصيانة؟'))) quick({ maintenance: !c.maintenance }, c.maintenance ? tx('Maintenance terminée', 'انتهت الصيانة') : tx('Maintenance activée', 'تم تفعيل الصيانة')); }}>🛠 {c.maintenance ? tx('Terminer la maintenance', 'إنهاء الصيانة') : tx('Maintenance', 'الصيانة')}</button>
            <button className="btn bg-slate-900 text-white" onClick={() => setTab('subscription')}>✎ {tx('Modifier l\'abonnement', 'تعديل الاشتراك')}</button>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-black mb-3">{tx('Points d\'attention', 'نقاط الانتباه')}</h2>
          {alerts.length ? alerts.map(([tone, text], i) => <div key={i} className={'saas-alert ' + tone}>{text}</div>) : <p className="text-sm text-emerald-700">✔ {tx('Tout est en ordre.', 'كل شيء على ما يرام.')}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {SAAS_LIMITS.map(l => <SaasGauge key={l.key} label={tx(l.fr, l.ar)} icon={l.icon} used={counts[l.key]} limit={c[l.col]} />)}
      </div>
      <div className="pro-kpi-grid">
        <div className="pro-kpi-card"><span>{tx('Modules actifs', 'الوحدات المفعلة')}</span><b>{data.modules.filter(m => m.enabled !== false).length} / {data.modules.length}</b><small>{tx('dont socle', 'منها الأساس')} {data.modules.filter(m => m.locked).length}</small></div>
        <div className="pro-kpi-card"><span>{tx('Sessions ouvertes', 'الجلسات المفتوحة')}</span><b>{counts.sessions ?? 0}</b><small>{tx('connexions en cours', 'اتصالات جارية')}</small></div>
        <div className="pro-kpi-card"><span>{tx('Ventes ce mois', 'مبيعات هذا الشهر')}</span><b>{counts.salesMonth ?? 0}</b><small>{dh(counts.salesMonthTotal || 0)} {tx('facturé', 'مفوتر')}</small></div>
        <div className="pro-kpi-card"><span>{tx('Achats ce mois', 'مشتريات هذا الشهر')}</span><b>{counts.purchasesMonth ?? 0}</b><small>{tx('documents', 'وثائق')}</small></div>
        <div className="pro-kpi-card"><span>{tx('Clients / Fournisseurs', 'الزبناء / الموردون')}</span><b>{counts.clients ?? 0} / {counts.suppliers ?? 0}</b><small>{tx('fiches', 'بطاقات')}</small></div>
        <div className="pro-kpi-card"><span>{tx('Pièces jointes', 'المرفقات')}</span><b>{counts.attachments ?? 0}</b><small>{tx('fichiers', 'ملفات')}</small></div>
      </div>
      {c.updated_by ? <p className="text-xs text-slate-400 mt-3">{tx('Dernière modification', 'آخر تعديل')} : {c.updated_by} · {c.updated_at ? new Date(c.updated_at).toLocaleString('fr-FR') : ''}</p> : null}
    </>
  );
}

function SaasField({ label, hint, children, wide }) {
  return (
    <label className={'text-xs text-slate-500 block ' + (wide ? 'md:col-span-2' : '')}>
      {label}
      {children}
      {hint ? <span className="block text-[11px] text-slate-400 mt-0.5">{hint}</span> : null}
    </label>
  );
}

function SaasSubscription({ data, reload, setTab }) {
  const [f, setF] = useState(() => ({ ...(data.control || {}) }));
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  const amount = saasAmount(f, data.plans, data.modules);
  const plan = data.plans.find(p => p.code === f.plan_code);
  const expiry = f.status === 'trial' ? (f.trial_end || f.end_date) : f.end_date;
  const blockDate = expiry ? new Date(new Date(expiry + 'T12:00:00Z').getTime() + Number(f.grace_days || 0) * 86400000).toISOString().slice(0, 10) : null;

  async function save() {
    setBusy(true);
    try {
      const fields = ['client_name', 'client_contact', 'client_email', 'client_phone', 'client_city', 'billing_cycle', 'discount_pct', 'price_override', 'status', 'start_date', 'end_date', 'trial_end', 'grace_days', 'warn_days', 'on_expiry', 'max_branches', 'max_users', 'max_products', 'notes'];
      const patch = Object.fromEntries(fields.map(k => [k, f[k] ?? (k === 'price_override' || k.startsWith('max_') ? null : '')]));
      await saveSaasControl(patch, 'Abonnement');
      if (['suspended', 'canceled'].includes(f.status) && f.on_expiry === 'block') await supabase.rpc('app_saas_kick', { p_user: null });
      showToast(tx('Abonnement enregistré', 'تم حفظ الاشتراك'));
      await reload();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }
  const lim = (col, ph) => (
    <input className="input mt-1" type="number" min="0" placeholder={ph} value={f[col] ?? ''} data-limit={col} onChange={e => set(col, e.target.value === '' ? null : e.target.value)} />
  );

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-5">
          <h2 className="font-black mb-3">🏢 {tx('Client', 'الزبون')}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <SaasField label={tx('Raison sociale', 'الاسم التجاري')} wide><input className="input mt-1" data-f="client_name" value={f.client_name || ''} onChange={e => set('client_name', e.target.value)} /></SaasField>
            <SaasField label={tx('Contact', 'المسؤول')}><input className="input mt-1" value={f.client_contact || ''} onChange={e => set('client_contact', e.target.value)} /></SaasField>
            <SaasField label={tx('Téléphone', 'الهاتف')}><input className="input mt-1" inputMode="tel" value={f.client_phone || ''} onChange={e => set('client_phone', e.target.value)} /></SaasField>
            <SaasField label="E-mail"><input className="input mt-1" type="email" value={f.client_email || ''} onChange={e => set('client_email', e.target.value)} /></SaasField>
            <SaasField label={tx('Ville', 'المدينة')}><input className="input mt-1" value={f.client_city || ''} onChange={e => set('client_city', e.target.value)} /></SaasField>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-black mb-3">📅 {tx('Période et statut', 'المدة والحالة')}</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <SaasField label={tx('Statut', 'الحالة')}>
              <select className="input mt-1" data-f="status" value={f.status || 'active'} onChange={e => set('status', e.target.value)}>
                {Object.entries(SAAS_STATUS).map(([k, s]) => <option key={k} value={k}>{tx(s.fr, s.ar)}</option>)}
              </select>
            </SaasField>
            <SaasField label={tx('Début', 'البداية')}><input className="input mt-1" type="date" value={f.start_date || ''} onChange={e => set('start_date', e.target.value)} /></SaasField>
            <SaasField label={tx('Fin / renouvellement', 'النهاية / التجديد')} hint={tx('Vide = sans date de fin', 'فارغ = بدون تاريخ')}><input className="input mt-1" type="date" data-f="end_date" value={f.end_date || ''} onChange={e => set('end_date', e.target.value)} /></SaasField>
            {f.status === 'trial' ? <SaasField label={tx('Fin de l\'essai', 'نهاية التجربة')}><input className="input mt-1" type="date" value={f.trial_end || ''} onChange={e => set('trial_end', e.target.value)} /></SaasField> : null}
            <SaasField label={tx('Prévenir l\'administrateur (jours avant)', 'تنبيه المدير (أيام قبل)')}><input className="input mt-1" type="number" min="0" value={f.warn_days ?? 15} onChange={e => set('warn_days', e.target.value)} /></SaasField>
          </div>
          <div className="saas-expiry mt-4">
            <div className="text-xs font-bold text-slate-500 mb-2">{tx('Quand l\'abonnement est expiré ou suspendu', 'عند انتهاء أو إيقاف الاشتراك')}</div>
            <label className="flex items-center gap-2 text-sm mb-1"><input type="radio" name="onexp" data-onexp="banner" checked={f.on_expiry !== 'block'} onChange={() => set('on_expiry', 'banner')} /> {tx('Bandeau d\'alerte seulement (aucun blocage)', 'شريط تنبيه فقط')}</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="onexp" data-onexp="block" checked={f.on_expiry === 'block'} onChange={() => set('on_expiry', 'block')} /> {tx('Bloquer la connexion après', 'حظر الدخول بعد')}
              <input className="input inline-num" type="number" min="0" data-f="grace_days" value={f.grace_days ?? 7} onChange={e => set('grace_days', e.target.value)} /> {tx('jour(s) de grâce (le SuperAdmin garde l\'accès)', 'يوم سماح')}
            </label>
            {expiry ? <p className="text-xs text-slate-500 mt-2">{tx('Échéance', 'الانتهاء')} {frDate(expiry)}{f.on_expiry === 'block' ? ' · ' + tx('blocage le', 'الحظر في') + ' ' + frDate(blockDate) : ''}</p> : null}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-black mb-1">🚦 {tx('Limites', 'الحدود')}</h2>
          <p className="text-xs text-slate-500 mb-3">{tx('Remplies par la formule appliquée, modifiables ici. Vide = illimité. La base refuse toute création au-delà (le SuperAdmin n\'est pas limité).', 'فارغ = بدون حد. القاعدة ترفض أي تجاوز.')}</p>
          <div className="grid md:grid-cols-3 gap-3">
            {SAAS_LIMITS.map(l => <SaasField key={l.col} label={l.icon + ' ' + tx(l.fr, l.ar)} hint={tx('Actuellement', 'حاليا') + ' : ' + (data.state?.counts?.[l.key] ?? 0)}>{lim(l.col, '∞')}</SaasField>)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h2 className="font-black mb-3">💳 {tx('Facturation', 'الفوترة')}</h2>
          <div className="text-sm mb-2">{tx('Formule', 'الباقة')} : <b>{plan?.name || f.plan_code}</b> <button className="text-xs underline text-sky-700 ms-1" onClick={() => setTab('plans')}>{tx('Changer de formule', 'تغيير الباقة')}</button></div>
          <SaasField label={tx('Périodicité', 'الدورية')}>
            <select className="input mt-1 mb-2" value={f.billing_cycle || 'monthly'} onChange={e => set('billing_cycle', e.target.value)}>
              <option value="monthly">{tx('Mensuelle', 'شهرية')}</option>
              <option value="yearly">{tx('Annuelle', 'سنوية')}</option>
            </select>
          </SaasField>
          <div className="grid grid-cols-2 gap-2">
            <SaasField label={tx('Remise (%)', 'التخفيض (%)')}><input className="input mt-1" type="number" min="0" max="100" value={f.discount_pct ?? 0} onChange={e => set('discount_pct', e.target.value)} /></SaasField>
            <SaasField label={tx('Prix forcé (DH)', 'ثمن محدد')} hint={tx('Vide = calculé', 'فارغ = محسوب')}><input className="input mt-1" type="number" min="0" value={f.price_override ?? ''} onChange={e => set('price_override', e.target.value === '' ? null : e.target.value)} /></SaasField>
          </div>
          <div className="saas-bill mt-3">
            <div><span>{tx('Formule', 'الباقة')}</span><b>{fmt(amount.base)}</b></div>
            {amount.addons.map(m => <div key={m.code} className="text-slate-500"><span>＋ {m.name}</span><b>{fmt(amount.yearly ? m.yearly_price : m.monthly_price)}</b></div>)}
            {amount.forced ? <div className="text-slate-500"><span>{tx('Prix forcé', 'ثمن محدد')}</span><b>{fmt(f.price_override)}</b></div> : null}
            {amount.discount ? <div className="text-slate-500"><span>{tx('Remise', 'تخفيض')} {fmt(f.discount_pct)} %</span><b>− {fmt(amount.discount)}</b></div> : null}
            <div className="saas-bill-total"><span>{amount.yearly ? tx('Total par an', 'المجموع سنويا') : tx('Total par mois', 'المجموع شهريا')}</span><b data-saas-total>{dh(amount.total)}</b></div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-black mb-2">📝 {tx('Notes internes', 'ملاحظات داخلية')}</h2>
          <textarea className="input" rows="4" value={f.notes || ''} onChange={e => set('notes', e.target.value)} placeholder={tx('Conditions particulières, historique des échanges…', 'شروط خاصة…')} />
        </div>
        <button disabled={busy} onClick={save} className="btn bg-amber-500 w-full" data-saas-save>{busy ? '…' : '💾 ' + tx('Enregistrer l\'abonnement', 'حفظ الاشتراك')}</button>
      </div>
    </div>
  );
}

function SaasPlans({ data, reload }) {
  const [edit, setEdit] = useState(null);
  const [apply, setApply] = useState(null);
  const [busy, setBusy] = useState(false);
  const current = data.control?.plan_code;
  const mods = data.modules;
  const modName = code => mods.find(m => m.code === code)?.name || code;

  async function savePlan() {
    setBusy(true);
    try { await saveSaasPlan(edit); setEdit(null); showToast(tx('Formule enregistrée', 'تم حفظ الباقة')); await reload(); } catch (e) { alert(e.message); }
    setBusy(false);
  }
  async function removePlan(p) {
    if (p.code === current) return alert(tx('Formule en cours d\'utilisation : changez d\'abord de formule.', 'الباقة مستعملة حاليا.'));
    if (!confirm(tx('Supprimer la formule « ' + p.name + ' » ?', 'حذف الباقة؟'))) return;
    try { await deleteSaasPlan(p.code); await reload(); } catch (e) { alert(e.message); }
  }
  async function doApply() {
    setBusy(true);
    try {
      const r = await applySaasPlan(apply.plan.code, apply.limits);
      showToast(tx('Formule « ' + apply.plan.name + ' » appliquée : ' + (r?.enabled || 0) + ' module(s) activé(s), ' + (r?.disabled || 0) + ' désactivé(s)', 'تم تطبيق الباقة'));
      setApply(null);
      await reload();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }
  function openApply(p) {
    const list = Array.isArray(p.modules) ? p.modules : [];
    const custom = !list.length;
    const toOn = custom ? [] : mods.filter(m => m.enabled === false && (list.includes(m.code) || m.locked));
    const toOff = custom ? [] : mods.filter(m => m.enabled !== false && !list.includes(m.code) && !m.locked);
    setApply({ plan: p, toOn, toOff, custom, limits: true });
  }
  const limitTxt = v => (v === null || v === undefined ? '∞' : v);

  return (
    <>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <p className="text-sm text-slate-500">{tx('Une formule regroupe des modules, des prix et des limites. « Appliquer » active ses modules et coupe les autres (sauf le socle).', 'الباقة تجمع الوحدات والأثمنة والحدود.')}</p>
        <button className="btn bg-amber-500" data-plan-new onClick={() => setEdit({ code: '', name: '', description: '', monthly_price: 0, yearly_price: 0, modules: mods.filter(m => m.locked).map(m => m.code), max_branches: null, max_users: null, max_products: null, sort_order: (data.plans.length + 1) * 10, isNew: true })}>＋ {tx('Nouvelle formule', 'باقة جديدة')}</button>
      </div>
      <div className="saas-plans">
        {data.plans.map(p => {
          const list = Array.isArray(p.modules) ? p.modules : [];
          return (
            <div key={p.code} className={'saas-plan card p-4 ' + (p.code === current ? 'current' : '')} data-plan={p.code}>
              <div className="flex justify-between items-start gap-2">
                <div><div className="font-black text-lg">{p.name}</div><div className="text-xs text-slate-500">{p.description}</div></div>
                {p.code === current ? <Badge tone="amber">{tx('Formule actuelle', 'الباقة الحالية')}</Badge> : null}
              </div>
              <div className="saas-plan-price"><b>{fmt(p.monthly_price)}</b> DH / {tx('mois', 'شهر')} <span>· {fmt(p.yearly_price)} DH / {tx('an', 'سنة')}</span></div>
              <div className="text-xs text-slate-600 mb-2">🏬 {limitTxt(p.max_branches)} · 👤 {limitTxt(p.max_users)} · 🏷️ {limitTxt(p.max_products)}</div>
              <div className="saas-plan-mods">{list.length ? list.map(c => <span key={c}>{modName(c)}</span>) : <i>{tx('Modules choisis un par un', 'وحدات مختارة يدويا')}</i>}</div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <button className="btn bg-slate-900 text-white text-sm" data-plan-apply={p.code} onClick={() => openApply(p)}>{p.code === current ? tx('Réappliquer', 'إعادة التطبيق') : tx('Appliquer', 'تطبيق')}</button>
                <button className="btn bg-white border text-sm" onClick={() => setEdit({ ...p, modules: list })}>{tx('Modifier', 'تعديل')}</button>
                {p.code !== current ? <button className="btn bg-white border text-red-600 text-sm" onClick={() => removePlan(p)}>🗑</button> : null}
              </div>
            </div>
          );
        })}
      </div>

      {edit ? (
        <Modal title={(edit.isNew ? tx('Nouvelle formule', 'باقة جديدة') : tx('Modifier la formule', 'تعديل الباقة')) + (edit.name ? ' — ' + edit.name : '')} onClose={() => setEdit(null)} wide>
          <div className="grid md:grid-cols-4 gap-3">
            <SaasField label={tx('Code', 'الرمز')}><input className="input mt-1" disabled={!edit.isNew} data-plan-code value={edit.code} onChange={e => setEdit({ ...edit, code: e.target.value })} placeholder="ex. premium" /></SaasField>
            <SaasField label={tx('Nom', 'الاسم')}><input className="input mt-1" data-plan-name value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} /></SaasField>
            <SaasField label={tx('Prix mensuel (DH)', 'الثمن الشهري')}><input className="input mt-1" type="number" min="0" data-plan-monthly value={edit.monthly_price ?? 0} onChange={e => setEdit({ ...edit, monthly_price: e.target.value })} /></SaasField>
            <SaasField label={tx('Prix annuel (DH)', 'الثمن السنوي')}><input className="input mt-1" type="number" min="0" value={edit.yearly_price ?? 0} onChange={e => setEdit({ ...edit, yearly_price: e.target.value })} /></SaasField>
            <SaasField label={tx('Description', 'الوصف')} wide><input className="input mt-1" value={edit.description || ''} onChange={e => setEdit({ ...edit, description: e.target.value })} /></SaasField>
            {SAAS_LIMITS.map(l => (
              <SaasField key={l.col} label={l.icon + ' ' + tx('Max ' + l.fr.toLowerCase(), l.ar)} hint={tx('Vide = illimité', 'فارغ = بدون حد')}>
                <input className="input mt-1" type="number" min="0" data-plan-limit={l.col} value={edit[l.col] ?? ''} onChange={e => setEdit({ ...edit, [l.col]: e.target.value === '' ? null : e.target.value })} />
              </SaasField>
            ))}
          </div>
          <div className="text-xs font-bold text-slate-500 mt-4 mb-2">{tx('Modules inclus (aucun = formule « sur mesure » : les modules ne changent pas à l\'application)', 'الوحدات المضمنة')}</div>
          {SAAS_CATEGORIES.map(cat => (
            <div key={cat.key} className="mb-2">
              <div className="text-xs text-slate-400 mb-1">{tx(cat.fr, cat.ar)}</div>
              <div className="flex flex-wrap gap-2">
                {mods.filter(m => m.category === cat.key).map(m => {
                  const on = edit.modules.includes(m.code);
                  return (
                    <label key={m.code} className={'saas-mod-chip ' + (on ? 'on' : '')}>
                      <input type="checkbox" checked={on} disabled={m.locked} onChange={e => {
                        let next = new Set(edit.modules);
                        if (e.target.checked) { next.add(m.code); (m.requires || []).forEach(r => next.add(r)); }
                        else { next.delete(m.code); mods.forEach(x => { if ((x.requires || []).includes(m.code)) next.delete(x.code); }); }
                        setEdit({ ...edit, modules: [...next] });
                      }} /> {m.name}{m.locked ? ' 🔒' : ''}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <button disabled={busy} onClick={savePlan} className="btn bg-amber-500 mt-3" data-plan-save>{tx('Enregistrer', 'حفظ')}</button>
        </Modal>
      ) : null}

      {apply ? (
        <Modal title={tx('Appliquer la formule', 'تطبيق الباقة') + ' « ' + apply.plan.name + ' »'} onClose={() => setApply(null)}>
          {apply.custom ? <p className="text-sm mb-2">{tx('Formule sur mesure : les modules actuels sont conservés, gérez-les dans l\'onglet Modules.', 'الوحدات الحالية تبقى كما هي.')}</p> : (
            <>
              <div className="text-sm mb-2"><b>{apply.toOn.length}</b> {tx('module(s) activé(s)', 'وحدة ستفعّل')}{apply.toOn.length ? ' : ' + apply.toOn.map(m => m.name).join(', ') : ''}</div>
              <div className="text-sm mb-3"><b className={apply.toOff.length ? 'text-red-600' : ''}>{apply.toOff.length}</b> {tx('module(s) coupé(s)', 'وحدة ستعطّل')}{apply.toOff.length ? ' : ' + apply.toOff.map(m => m.name).join(', ') : ''}</div>
            </>
          )}
          <label className="flex items-center gap-2 text-sm mb-3"><input type="checkbox" data-apply-limits checked={apply.limits} onChange={e => setApply({ ...apply, limits: e.target.checked })} /> {tx('Appliquer aussi les limites', 'تطبيق الحدود أيضا')} (🏬 {limitTxt(apply.plan.max_branches)} · 👤 {limitTxt(apply.plan.max_users)} · 🏷️ {limitTxt(apply.plan.max_products)})</label>
          <p className="text-xs text-slate-500 mb-3">{tx('Les données ne sont jamais supprimées : un module coupé disparaît seulement du menu.', 'لا تحذف أي بيانات.')}</p>
          <button disabled={busy} onClick={doApply} className="btn bg-slate-900 text-white" data-apply-confirm>✔ {tx('Appliquer', 'تطبيق')}</button>
        </Modal>
      ) : null}
    </>
  );
}

function SaasModules({ data, reload }) {
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const plan = data.plans.find(p => p.code === data.control?.plan_code);
  const planMods = plan && Array.isArray(plan.modules) ? plan.modules : [];
  const mods = data.modules;
  const byCode = Object.fromEntries(mods.map(m => [m.code, m]));
  const dependents = code => mods.filter(m => (m.requires || []).includes(code)).map(m => m.name);

  async function setEnabled(codes, enabled) {
    for (const code of codes) { const m = byCode[code]; if (m && !m.locked) await saveSaasModule({ ...m, enabled }); }
  }
  async function toggle(m) {
    if (m.locked) return;
    const enable = m.enabled === false;
    const cascade = saasModuleCascade(mods, m.code, enable);
    if (cascade.length && !confirm((enable ? tx('Activer aussi (nécessaires) : ', 'تفعيل أيضا: ') : tx('Couper aussi (dépendants) : ', 'تعطيل أيضا: ')) + cascade.map(c => byCode[c]?.name || c).join(', ') + ' ?')) return;
    setBusy(true);
    try {
      await setEnabled([m.code, ...cascade], enable);
      await auditLog('SaaS', 'UPDATE', 'Module ' + m.name, (enable ? 'activé' : 'désactivé') + (cascade.length ? ' (+ ' + cascade.join(', ') + ')' : ''));
      const disabled = await refreshSaasModulesCache();
      window.dispatchEvent(new CustomEvent('droguerie_modules_changed', { detail: disabled }));
      await reload();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }
  async function updatePrice(m, field, value) {
    if (Number(value || 0) === Number(m[field] || 0)) return;
    try { await saveSaasModule({ ...m, [field]: Number(value || 0) }); await auditLog('SaaS', 'UPDATE', 'Prix module ' + m.name, field + ' = ' + value); await reload(); } catch (e) { alert(e.message); }
  }
  async function enableAll() {
    if (!confirm(tx('Activer tous les modules ?', 'تفعيل كل الوحدات؟'))) return;
    setBusy(true);
    try { await setEnabled(mods.filter(m => m.enabled === false).map(m => m.code), true); await auditLog('SaaS', 'UPDATE', 'Modules', 'Tous activés'); const d = await refreshSaasModulesCache(); window.dispatchEvent(new CustomEvent('droguerie_modules_changed', { detail: d })); await reload(); } catch (e) { alert(e.message); }
    setBusy(false);
  }
  const q = normSearch(search);
  const visible = mods.filter(m => !q || normSearch([m.code, m.name, m.description].join(' ')).includes(q));
  const monthly = mods.filter(m => m.enabled !== false).reduce((t, m) => t + Number(m.monthly_price || 0), 0);

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
        <input className="input max-w-xs" placeholder={'🔎 ' + tx('Rechercher un module', 'بحث عن وحدة')} value={search} onChange={e => setSearch(e.target.value)} data-mod-search />
        <div className="flex gap-2 items-center text-sm">
          <span className="text-slate-500">{tx('Modules actifs', 'الوحدات المفعلة')} : <b>{mods.filter(m => m.enabled !== false).length} / {mods.length}</b> · {tx('total des prix mensuels', 'مجموع الأثمنة الشهرية')} <b>{dh(monthly)}</b></span>
          <button disabled={busy} onClick={enableAll} className="btn bg-white border text-sm">{tx('Tout activer', 'تفعيل الكل')}</button>
        </div>
      </div>
      {SAAS_CATEGORIES.map(cat => {
        const rows = visible.filter(m => m.category === cat.key);
        if (!rows.length) return null;
        return (
          <div key={cat.key} className="card p-4 mb-4 overflow-auto">
            <h2 className="font-black mb-3">{tx(cat.fr, cat.ar)}</h2>
            <table className="table w-full">
              <thead>
                <tr><th>{tx('Module', 'الوحدة')}</th><th>{tx('Nécessite', 'يتطلب')}</th><th>{tx('Formule', 'الباقة')}</th><th>{tx('Prix mensuel', 'الثمن الشهري')}</th><th>{tx('Prix annuel', 'الثمن السنوي')}</th><th>{tx('État', 'الحالة')}</th></tr>
              </thead>
              <tbody>
                {rows.map(m => (
                  <tr key={m.code} data-module={m.code}>
                    <td><div className="font-semibold">{m.name}</div><div className="text-xs text-slate-500">{m.description}</div><div className="font-mono text-[11px] text-slate-400">{m.code}</div></td>
                    <td className="text-xs">{(m.requires || []).map(r => byCode[r]?.name || r).join(', ') || '—'}{dependents(m.code).length ? <div className="text-slate-400">{tx('utilisé par', 'تستعمله')} : {dependents(m.code).join(', ')}</div> : null}</td>
                    <td className="whitespace-nowrap">{planMods.length ? (planMods.includes(m.code) ? <Badge tone="green">✓ {tx('inclus', 'مضمن')}</Badge> : <Badge tone="amber">{tx('option', 'إضافة')}</Badge>) : '—'}</td>
                    <td><input className="input max-w-[110px]" type="number" min="0" defaultValue={m.monthly_price || 0} onBlur={e => updatePrice(m, 'monthly_price', e.target.value)} /></td>
                    <td><input className="input max-w-[110px]" type="number" min="0" defaultValue={m.yearly_price || 0} onBlur={e => updatePrice(m, 'yearly_price', e.target.value)} /></td>
                    <td>
                      {m.locked ? <span className="text-xs text-slate-500" title={tx('Module socle : toujours actif', 'وحدة أساسية')}>🔒 {tx('Socle', 'أساس')}</span> : (
                        <button disabled={busy} onClick={() => toggle(m)} data-mod-toggle={m.code} className={'saas-switch ' + (m.enabled !== false ? 'on' : 'off')} aria-pressed={m.enabled !== false}>
                          <i />{m.enabled !== false ? tx('Activé', 'مفعّل') : tx('Désactivé', 'معطّل')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}

function SaasUsage({ data, stats, reload }) {
  const [users, setUsers] = useState(null);
  const [activity, setActivity] = useState([]);
  const [msg, setMsg] = useState('');
  const c = data.control || {};
  const counts = data.state?.counts || {};
  async function loadMore() {
    if (!data.ready) return;
    const [u, a] = await Promise.all([supabase.rpc('app_saas_users'), supabase.rpc('app_saas_activity')]);
    if (u.error) setMsg(u.error.message);
    setUsers(u.data || []);
    setActivity(a.data || []);
  }
  useEffect(() => { loadMore(); }, []);
  async function kick(u) {
    if (!confirm(u ? tx('Déconnecter ' + (u.full_name || u.username) + ' ?', 'قطع اتصال المستخدم؟') : tx('Déconnecter tous les utilisateurs (sauf SuperAdmin) ?', 'قطع اتصال الجميع؟'))) return;
    const { data: n, error } = await supabase.rpc('app_saas_kick', { p_user: u ? u.id : null });
    if (error) return alert(error.message);
    await auditLog('SaaS', 'LOGOUT', u ? (u.full_name || u.username) : 'Tous les utilisateurs', (n || 0) + ' session(s) fermée(s)');
    showToast(tx((n || 0) + ' session(s) fermée(s)', 'تم إغلاق ' + (n || 0) + ' جلسة'));
    await loadMore();
    reload();
  }
  const ago = d => {
    if (!d) return tx('Jamais', 'أبدا');
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    return new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) + (days >= 1 ? ' · ' + tx('il y a ' + days + ' j', 'منذ ' + days + ' يوم') : '');
  };

  return (
    <>
      {data.ready ? (
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {SAAS_LIMITS.map(l => <SaasGauge key={l.key} label={tx(l.fr, l.ar)} icon={l.icon} used={counts[l.key]} limit={c[l.col]} />)}
        </div>
      ) : null}
      {data.ready ? (
        <div className="grid gap-4 mb-4">
          <div className="card p-5 overflow-auto">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h2 className="font-black">👤 {tx('Utilisateurs et connexions', 'المستخدمون والاتصالات')}</h2>
              <button className="btn bg-white border text-sm text-red-600" data-kick-all onClick={() => kick(null)}>⏏ {tx('Déconnecter tout le monde', 'قطع اتصال الجميع')}</button>
            </div>
            {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
            <table className="table w-full">
              <thead><tr><th>{tx('Utilisateur', 'المستخدم')}</th><th>{tx('Profil', 'الدور')}</th><th>{tx('Droguerie', 'المحل')}</th><th>{tx('Dernière connexion', 'آخر دخول')}</th><th>{tx('Dernière action', 'آخر عملية')}</th><th>{tx('Sessions', 'الجلسات')}</th><th></th></tr></thead>
              <tbody>
                {(users || []).map(u => (
                  <tr key={u.id} data-user-row={u.username} className={u.active ? '' : 'opacity-50'}>
                    <td><div className="font-semibold">{u.full_name || u.username}</div><div className="text-xs text-slate-400">{u.username}{u.active ? '' : ' · ' + tx('désactivé', 'معطّل')}</div></td>
                    <td className="text-sm">{u.role}</td>
                    <td className="text-sm">{u.branch || '—'}</td>
                    <td className="text-xs whitespace-nowrap">{ago(u.last_login_at)}</td>
                    <td className="text-xs whitespace-nowrap">{u.last_action ? ago(u.last_action) : '—'}</td>
                    <td>{u.sessions ? <Badge tone="green">{u.sessions}</Badge> : <span className="text-slate-400">0</span>}</td>
                    <td>{u.sessions && !/super/i.test(u.role) ? <button className="btn bg-white border text-xs" data-kick={u.username} onClick={() => kick(u)}>⏏ {tx('Déconnecter', 'قطع')}</button> : null}</td>
                  </tr>
                ))}
                {users && !users.length ? <tr><td colSpan="7">{tx('Aucune donnée', 'لا توجد بيانات')}</td></tr> : null}
              </tbody>
            </table>
          </div>
          <div className="card p-5 overflow-auto">
            <h2 className="font-black mb-3">📈 {tx('Activité (6 mois)', 'النشاط (6 أشهر)')}</h2>
            <table className="table w-full">
              <thead><tr><th>{tx('Mois', 'الشهر')}</th><th>{tx('Ventes', 'المبيعات')}</th><th>{tx('Facturé', 'مفوتر')}</th><th>{tx('Achats', 'المشتريات')}</th><th>{tx('Connexions', 'الدخول')}</th></tr></thead>
              <tbody>
                {activity.map(a => <tr key={a.month}><td className="whitespace-nowrap">{a.month}</td><td>{a.sales}</td><td className="whitespace-nowrap">{fmt(a.sales_total)}</td><td>{a.purchases}</td><td>{a.logins}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <div className="card p-5 overflow-auto">
        <h2 className="font-black mb-3">🗄️ {tx('Statistiques de la base', 'إحصائيات قاعدة البيانات')}</h2>
        <table className="table w-full">
          <thead><tr><th>{tx('Table', 'الجدول')}</th><th>{tx('Enregistrements', 'السجلات')}</th></tr></thead>
          <tbody>{stats.map(s => <tr key={s.table}><td className="font-mono">{s.table}</td><td className="font-bold">{s.count}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

function SaasAnnouncementPreview({ a }) {
  if (!a?.announcement) return <p className="text-xs text-slate-400">{tx('Aucune annonce', 'لا يوجد إعلان')}</p>;
  return <div className={'saas-banner ' + (a.announcement_level || 'info')}>📣 {curLang() === 'ar' && a.announcement_ar ? a.announcement_ar : a.announcement}</div>;
}

function SaasMaintenance({ data, reload }) {
  const c = data.control || {};
  const [ann, setAnn] = useState({ announcement: c.announcement || '', announcement_ar: c.announcement_ar || '', announcement_level: c.announcement_level || 'info', announcement_from: c.announcement_from || '', announcement_until: c.announcement_until || '', announcement_audience: c.announcement_audience || 'all' });
  const [maint, setMaint] = useState({ maintenance: !!c.maintenance, maintenance_message: c.maintenance_message || '', kick: true });
  const [busy, setBusy] = useState(false);
  const [imp, setImp] = useState(null);

  async function saveAnn(clear) {
    setBusy(true);
    try {
      const patch = clear ? { announcement: '', announcement_ar: '', announcement_from: null, announcement_until: null } : ann;
      await saveSaasControl(patch, clear ? 'Annonce retirée' : 'Annonce');
      if (clear) setAnn({ ...ann, announcement: '', announcement_ar: '', announcement_from: '', announcement_until: '' });
      showToast(clear ? tx('Annonce retirée', 'تم سحب الإعلان') : tx('Annonce publiée', 'تم نشر الإعلان'));
      await reload();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }
  async function saveMaint() {
    setBusy(true);
    try {
      await saveSaasControl({ maintenance: maint.maintenance, maintenance_message: maint.maintenance_message }, maint.maintenance ? 'Maintenance activée' : 'Maintenance');
      let n = 0;
      if (maint.maintenance && maint.kick) { const r = await supabase.rpc('app_saas_kick', { p_user: null }); n = r.data || 0; }
      showToast(maint.maintenance ? tx('Maintenance activée', 'تم تفعيل الصيانة') + (n ? ' · ' + n + ' ' + tx('session(s) fermée(s)', 'جلسة') : '') : tx('Maintenance enregistrée', 'تم الحفظ'));
      await reload();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }
  async function readImport(file) {
    try {
      const conf = JSON.parse(await file.text());
      if (conf?.kind !== 'saas-config') throw new Error(tx('Fichier non reconnu (configuration SaaS DrogueriePro attendue)', 'ملف غير معروف'));
      setImp(conf);
    } catch (e) { alert(e.message); }
  }
  async function doImport() {
    setBusy(true);
    try {
      for (const p of imp.plans || []) await saveSaasPlan(p);
      for (const m of imp.modules || []) {
        const cur = data.modules.find(x => x.code === m.code);
        if (cur) {
          const { error } = await supabase.from('saas_modules').update({ enabled: m.enabled !== false, monthly_price: Number(m.monthly_price || 0), yearly_price: Number(m.yearly_price || 0), category: m.category || cur.category, requires: m.requires || cur.requires, locked: !!m.locked }).eq('code', m.code);
          if (error) throw new Error(error.message);
        }
      }
      if (imp.control) await saveSaasControl(imp.control, 'Configuration importée');
      if (Array.isArray(imp.featuresOff)) await supabase.from('app_settings').upsert({ key: 'features_off', value: JSON.stringify(imp.featuresOff) }, { onConflict: 'key' });
      await auditLog('SaaS', 'IMPORT', 'Configuration SaaS', (imp.plans || []).length + ' formules, ' + (imp.modules || []).length + ' modules');
      const d = await refreshSaasModulesCache();
      window.dispatchEvent(new CustomEvent('droguerie_modules_changed', { detail: d }));
      showToast(tx('Configuration importée', 'تم استيراد الإعدادات'));
      setImp(null);
      await reload();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card p-5">
        <h2 className="font-black mb-1">📣 {tx('Annonce aux utilisateurs', 'إعلان للمستخدمين')}</h2>
        <p className="text-xs text-slate-500 mb-3">{tx('Bandeau affiché en haut de l\'application pendant la période choisie.', 'شريط يظهر أعلى التطبيق خلال المدة المختارة.')}</p>
        <SaasField label={tx('Message (français)', 'الرسالة (فرنسية)')}><textarea className="input mt-1" rows="2" data-ann-text value={ann.announcement} onChange={e => setAnn({ ...ann, announcement: e.target.value })} placeholder={tx('Ex. : Nouvelle version disponible samedi…', 'مثال…')} /></SaasField>
        <SaasField label={tx('Message (arabe, facultatif)', 'الرسالة (عربية، اختياري)')}><textarea className="input mt-1" rows="2" dir="rtl" value={ann.announcement_ar} onChange={e => setAnn({ ...ann, announcement_ar: e.target.value })} /></SaasField>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          <SaasField label={tx('Niveau', 'المستوى')}>
            <select className="input mt-1" data-ann-level value={ann.announcement_level} onChange={e => setAnn({ ...ann, announcement_level: e.target.value })}>
              <option value="info">ℹ {tx('Information', 'معلومة')}</option>
              <option value="warning">⚠ {tx('Attention', 'تنبيه')}</option>
              <option value="danger">⛔ {tx('Important', 'مهم')}</option>
            </select>
          </SaasField>
          <SaasField label={tx('Destinataires', 'المستهدفون')}>
            <select className="input mt-1" value={ann.announcement_audience} onChange={e => setAnn({ ...ann, announcement_audience: e.target.value })}>
              <option value="all">{tx('Tous', 'الكل')}</option>
              <option value="admins">{tx('Administrateurs', 'المدراء')}</option>
            </select>
          </SaasField>
          <SaasField label={tx('Du', 'من')}><input className="input mt-1" type="date" value={ann.announcement_from || ''} onChange={e => setAnn({ ...ann, announcement_from: e.target.value })} /></SaasField>
          <SaasField label={tx('Au', 'إلى')}><input className="input mt-1" type="date" value={ann.announcement_until || ''} onChange={e => setAnn({ ...ann, announcement_until: e.target.value })} /></SaasField>
        </div>
        <div className="text-xs font-bold text-slate-500 mt-3 mb-1">{tx('Aperçu', 'معاينة')}</div>
        <SaasAnnouncementPreview a={ann} />
        <div className="flex gap-2 mt-3">
          <button disabled={busy} onClick={() => saveAnn(false)} className="btn bg-amber-500" data-ann-save>{tx('Publier', 'نشر')}</button>
          {c.announcement ? <button disabled={busy} onClick={() => saveAnn(true)} className="btn bg-white border">{tx('Retirer l\'annonce', 'سحب الإعلان')}</button> : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className={'card p-5 ' + (c.maintenance ? 'saas-maint-on' : '')}>
          <h2 className="font-black mb-1">🛠 {tx('Mode maintenance', 'وضع الصيانة')}</h2>
          <p className="text-xs text-slate-500 mb-3">{tx('Pendant la maintenance, seuls les SuperAdmin peuvent se connecter. Le message s\'affiche sur l\'écran de connexion.', 'أثناء الصيانة يدخل المدير العام فقط.')}</p>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2"><input type="checkbox" data-maint-toggle checked={maint.maintenance} onChange={e => setMaint({ ...maint, maintenance: e.target.checked })} /> {tx('Activer la maintenance', 'تفعيل الصيانة')}</label>
          <SaasField label={tx('Message affiché', 'الرسالة المعروضة')}><input className="input mt-1" data-maint-msg value={maint.maintenance_message} onChange={e => setMaint({ ...maint, maintenance_message: e.target.value })} placeholder={tx('Ex. : mise à jour, retour vers 14 h', 'مثال: تحديث، العودة على الساعة 14')} /></SaasField>
          {maint.maintenance ? <label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={maint.kick} onChange={e => setMaint({ ...maint, kick: e.target.checked })} /> {tx('Déconnecter immédiatement les utilisateurs connectés', 'قطع اتصال المستخدمين فورا')}</label> : null}
          <button disabled={busy} onClick={saveMaint} className={'btn mt-3 ' + (maint.maintenance ? 'bg-red-600 text-white' : 'bg-slate-900 text-white')} data-maint-save>{tx('Enregistrer', 'حفظ')}</button>
        </div>

        <div className="card p-5">
          <h2 className="font-black mb-1">⇄ {tx('Configuration (export / import)', 'الإعدادات (تصدير / استيراد)')}</h2>
          <p className="text-xs text-slate-500 mb-3">{tx('Copie de l\'abonnement, des formules, des modules et des fonctions dans un fichier JSON, par exemple pour préparer une nouvelle instance. Les données métier ne sont pas concernées.', 'نسخة من الاشتراك والباقات والوحدات في ملف JSON.')}</p>
          <input type="file" accept="application/json,.json" data-import-file onChange={e => e.target.files?.[0] && readImport(e.target.files[0])} />
          {imp ? (
            <div className="bg-slate-50 border rounded-xl p-3 mt-3 text-sm">
              <div>{tx('Fichier du', 'ملف بتاريخ')} {imp.exportedAt ? new Date(imp.exportedAt).toLocaleString('fr-FR') : '?'} : <b>{(imp.plans || []).length}</b> {tx('formules', 'باقات')}, <b>{(imp.modules || []).length}</b> {tx('modules', 'وحدات')}{imp.control ? ', ' + tx('abonnement', 'اشتراك') + ' « ' + (imp.control.client_name || '-') + ' »' : ''}</div>
              <button disabled={busy} onClick={doImport} className="btn bg-amber-500 mt-2" data-import-confirm>{tx('Importer et remplacer', 'استيراد واستبدال')}</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SaasJournal() {
  const [rows, setRows] = useState(null);
  const [kind, setKind] = useState('saas');
  const [search, setSearch] = useState('');
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('audit_logs').select('id, module, action, object_label, detail, user_label, created_at')
        .in('module', kind === 'saas' ? ['SaaS'] : ['Connexion']).order('created_at', { ascending: false }).limit(300);
      setRows(error ? [] : data || []);
    })();
  }, [kind]);
  const q = normSearch(search);
  const list = (rows || []).filter(r => !q || normSearch([r.action, r.object_label, r.detail, r.user_label].join(' ')).includes(q));
  return (
    <div className="card p-5 overflow-auto">
      <div className="flex flex-wrap gap-2 items-center mb-3">
        {[['saas', tx('Actions SuperAdmin', 'عمليات المدير العام')], ['login', tx('Connexions', 'الدخول')]].map(([k, t]) => (
          <button key={k} className={'chip ' + (kind === k ? 'chip-on' : '')} data-journal={k} onClick={() => setKind(k)}>{t}</button>
        ))}
        <input className="input max-w-xs" placeholder={'🔎 ' + tx('Rechercher', 'بحث')} value={search} onChange={e => setSearch(e.target.value)} />
        <span className="text-xs text-slate-400">{list.length}</span>
      </div>
      <table className="table w-full">
        <thead><tr><th>{tx('Date', 'التاريخ')}</th><th>{tx('Utilisateur', 'المستخدم')}</th><th>{tx('Action', 'العملية')}</th><th>{tx('Objet', 'الموضوع')}</th><th>{tx('Détail', 'التفاصيل')}</th></tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.id}>
              <td className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
              <td className="text-sm">{r.user_label || '—'}</td>
              <td><Badge tone={r.action === 'DELETE' ? 'red' : r.action === 'LOGIN' ? 'blue' : 'slate'}>{r.action}</Badge></td>
              <td className="text-sm font-semibold">{r.object_label}</td>
              <td className="text-xs text-slate-500 break-all">{r.detail}</td>
            </tr>
          ))}
          {rows && !list.length ? <tr><td colSpan="5" className="text-center text-slate-500 py-6">{tx('Aucune donnée', 'لا توجد بيانات')}</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

// Bandeaux pour tous les utilisateurs : annonce, maintenance, échéance, suspension, limites
function SaasBanner({ session }) {
  const [st, setSt] = useState(null);
  const [hidden, setHidden] = useState(() => { try { return JSON.parse(sessionStorage.getItem('dp_saas_hidden') || '[]'); } catch { return []; } });
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.rpc('app_saas_state');
        if (!stop && !error) setSt(data || null);
      } catch {}
    };
    load();
    const t = setInterval(load, 10 * 60 * 1000);
    const h = () => load();
    window.addEventListener('droguerie_saas_changed', h);
    return () => { stop = true; clearInterval(t); window.removeEventListener('droguerie_saas_changed', h); };
  }, [session?.token]);
  if (!st || !st.configured) return null;
  const admin = isAdmin(session);
  const sa = isSuperAdmin(session);
  const items = [];
  if (st.announcement) items.push({ key: 'ann-' + String(st.announcement.text).slice(0, 40), level: st.announcement.level || 'info', text: '📣 ' + (curLang() === 'ar' && st.announcement.textAr ? st.announcement.textAr : st.announcement.text) });
  if (st.maintenance && sa) items.push({ key: 'maint', level: 'danger', text: '🛠 ' + tx('Mode maintenance actif : seuls les SuperAdmin peuvent se connecter.', 'وضع الصيانة مفعّل: الدخول للمدير العام فقط.'), sticky: true });
  if (['suspended', 'canceled'].includes(st.status)) items.push({ key: 'susp', level: 'danger', text: '⛔ ' + tx('Abonnement ' + (st.status === 'suspended' ? 'suspendu' : 'résilié') + '. Contactez votre fournisseur DrogueriePro.', 'الاشتراك موقوف. اتصلوا بمزود DrogueriePro.'), sticky: true });
  else if (st.expired && (admin || st.onExpiry === 'block')) items.push({ key: 'exp', level: 'danger', text: '⌛ ' + tx('Abonnement expiré le ' + frDate(st.expiry) + (st.onExpiry === 'block' ? ' : l\'accès sera bloqué le ' + frDate(st.blockDate) + '.' : '.') + ' Contactez votre fournisseur DrogueriePro.', 'انتهى الاشتراك في ' + frDate(st.expiry)), sticky: true });
  else if (admin && st.daysLeft !== null && st.daysLeft !== undefined && st.daysLeft <= Number(st.warnDays || 0)) items.push({ key: 'warn-' + st.expiry, level: 'warning', text: '⏳ ' + tx((sa ? 'Abonnement du client : échéance le ' : 'Votre abonnement arrive à échéance le ') + frDate(st.expiry) + ' (dans ' + st.daysLeft + ' jour(s)).', 'ينتهي الاشتراك في ' + frDate(st.expiry)) });
  if (admin && !sa) {
    SAAS_LIMITS.forEach(l => {
      const lim = st.limits?.[l.key]; const used = Number(st.counts?.[l.key] || 0);
      if (lim !== null && lim !== undefined && used >= Number(lim)) items.push({ key: 'lim-' + l.key, level: 'info', text: l.icon + ' ' + tx('Limite de votre formule atteinte : ' + l.fr.toLowerCase() + ' ' + used + ' / ' + lim + '.', 'تم بلوغ حد الباقة: ' + l.ar) });
    });
  }
  const show = items.filter(i => i.sticky || !hidden.includes(i.key));
  if (!show.length) return null;
  const hide = k => { const next = [...hidden, k]; setHidden(next); try { sessionStorage.setItem('dp_saas_hidden', JSON.stringify(next)); } catch {} };
  return (
    <div className="saas-banners no-print" data-saas-banners>
      {show.map(i => (
        <div key={i.key} className={'saas-banner ' + i.level} role="status" data-banner={i.key.split('-')[0]}>
          <span>{i.text}</span>
          {!i.sticky ? <button type="button" aria-label={tx('Fermer', 'إغلاق')} onClick={() => hide(i.key)}>✕</button> : null}
        </div>
      ))}
    </div>
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
        <ExportButtons L={L} spec={() => productsExportSpec(L, data.products)} />
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
      // V55 : « + Nouveau → Produit »
      if (takeQuickAction('products') === 'new' && can('products.write')) {
        setForm({ ref: '', nom: '', categorie: listData?.categories?.[0]?.name || 'Divers', unite: listData?.units?.[0]?.name || 'Pièce', prixAchat: 0, prixVente: 0, quantite: 0, stockMin: 0, branchId: currentBranchId() || branchData?.[0]?.id || '' });
      }
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
        <ExportButtons L={L} spec={() => productsExportSpec(L, visibleRows)} />
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
    exportExcel({
      fileName: 'Feuille_inventaire', title: L('inventory') + (cat && cat !== 'all' ? ' — ' + cat : ''),
      sheets: [{ name: L('inventory'), note: (branches.find(b => String(b.id) === String(invBranch))?.name || ''), totals: false, columns: [
        { key: 'ref', header: L('ref') }, { key: 'barcode', header: L('barcode') }, { key: 'nom', header: L('product') }, { key: 'unite', header: L('unit') },
        { key: 'quantite', header: L('inventoryTheo') || 'Stock théorique', type: 'qty' },
        { value: p => counts[p.id] ?? '', header: L('inventoryCounted') || 'Quantité comptée', type: 'qty', width: 18 },
        { value: () => '', header: L('note') || 'Remarque', width: 28 }
      ], rows: scope }]
    }).catch(e => alert(e.message));
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
    const br = getBrand();
    w.document.write(`<html><head><title>${escapeHtml(inv.number)}</title><style>body{font-family:Arial;font-size:12px;padding:20px;border-top:5px solid ${br.accent}}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}th{background:${br.primary};color:${textOn(br.primary)};-webkit-print-color-adjust:exact;print-color-adjust:exact}td.n{text-align:right}.hd{display:flex;gap:14px;align-items:center;margin-bottom:8px}.hd img{max-height:60px;max-width:170px;object-fit:contain}.hd b{font-size:18px;color:${br.primary}}</style></head><body>
      <div class="hd">${br.logo ? `<img src="${br.logo}">` : ''}<b>${escapeHtml(br.name || 'DrogueriePro')}</b></div>
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
  // V52 : la ligne d'en-têtes peut être précédée d'un titre (fichiers exportés par DrogueriePro)
  const known = new Set(Object.values(IMPORT_COLUMNS).flat().map(c => c[0]));
  let hIdx = matrix.slice(0, 15).findIndex(r => r.map(normalizeImportHeader).filter(h => known.has(h)).length >= 2);
  if (hIdx < 0) hIdx = 0;
  // Ligne « Total » ajoutée par l'export Excel : ignorée
  const isTotalRow = r => /^(total|المجموع)$/i.test(String(r.find(v => v !== '' && v !== null) ?? '').trim());
  if (matrix.length - hIdx < 2) throw new Error('Le fichier ne contient aucune ligne de données');
  const headers = matrix[hIdx].map(normalizeImportHeader);
  return matrix.slice(hIdx + 1).filter(r => !isTotalRow(r)).map((r, i) => {
    const o = { __line: i + hIdx + 2 };
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
    ${getBrand().logo ? `<div style="text-align:center"><img src="${getBrand().logo}" style="max-width:52mm;max-height:20mm;object-fit:contain;filter:grayscale(1)"></div>` : ''}
    ${getBrand().name ? `<div style="text-align:center;font-weight:bold">${escapeHtml(getBrand().name)}</div>` : ''}
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
    img.logo { max-width: 56mm; max-height: 22mm; object-fit: contain; filter: grayscale(1) contrast(1.3); margin-bottom: 2px; }
  </style></head><body>
  ${c.logo && c.ticketLogo !== false ? `<div class="c"><img class="logo" src="${c.logo}" alt=""></div>` : ''}
  <h1>${escapeHtml(c.name || 'DrogueriePro')}</h1>
  ${c.slogan ? `<div class="c"><i>${escapeHtml(c.slogan)}</i></div>` : ''}
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
  <div class="c">${escapeHtml(c.ticketMessage || 'Merci de votre visite')}</div>
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

// V53 : caisse rapide → tous les clients disponibles dans la droguerie (pas seulement le portefeuille du vendeur)
async function loadCounterClients() {
  const session = getStoredSession();
  const { data, error } = await supabase.from('clients').select('*').order('name');
  if (error) throw new Error(error.message);
  const bId = isAdmin(session) ? selectedBranchId(session) : branchId(session);
  // V56 : case « Comptoir » décochée → client absent de la caisse (les fiches comptoir restent toujours visibles)
  return (data || []).filter(x => partyInBranch(x, bId) && (x.is_walk_in || x.pos_visible !== false))
    .sort((a, b) => Number(!!b.is_walk_in) - Number(!!a.is_walk_in) || (a.is_walk_in && b.is_walk_in ? Number(a.id) - Number(b.id) : 0));
}
function counterWalkIn(clients) {
  const session = getStoredSession();
  const bId = isAdmin(session) ? (selectedBranchId(session) || branchId(session)) : branchId(session);
  // V56 : plusieurs fiches comptoir possibles par droguerie → la première créée est celle par défaut
  const walks = (clients || []).filter(c => c.is_walk_in).sort((a, b) => Number(a.id) - Number(b.id));
  return walks.find(c => Number(c.branch_id) === Number(bId)) || walks[0] || null;
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
  const [waTicket, setWaTicket] = useState(null);
  const [err, setErr] = useState('');
  const searchRef = React.useRef(null);

  async function load() {
    try {
      const session = getStoredSession();
      const [{ data, error }, cl, comp, vat] = await Promise.all([
        applyProductScope(supabase.from('products').select('*, branches(name)'), session).order('name'),
        loadCounterClients().catch(() => []),
        loadCompanySettings().catch(() => ({ name: 'DrogueriePro' })),
        getVatRate()
      ]);
      if (error) throw error;
      setProducts((data || []).map(mapProduct));
      setClients(cl || []);
      // V53 : la fiche « Client comptoir » de la droguerie est sélectionnée par défaut
      const walk = counterWalkIn(cl || []);
      if (walk) setClientId(prev => (prev && (cl || []).some(c => String(c.id) === String(prev)) ? prev : String(walk.id)));
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
    if (payMode === 'Crédit' && (!client || client.is_walk_in)) return alert(L('creditNeedsClient'));
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
        clientId: client && !client.is_walk_in ? client.id : null, clientPhone: client && !client.is_walk_in ? (client.phone || '') : '', clientName: client && !client.is_walk_in ? client.name : '',
        cashier: currentUserLabel(), lines: cart, totals: res.totals, payMode,
        received: payMode === 'Espèces' ? Number(received || res.totals.totalTTC) : 0,
        change: payMode === 'Espèces' ? Math.max(0, Number(received || 0) - res.totals.totalTTC) : 0
      };
      setLastTicket(ticket);
      printTicket(ticket);
      setCart([]); setReceived(''); setGlobalDiscount(''); setSearch('');
      { const walk = counterWalkIn(clients); if (walk) setClientId(String(walk.id)); }
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
        {lastTicket && featureOn('share') ? <button onClick={() => setWaTicket(lastTicket)} className="btn wa-send">🟢 WhatsApp</button> : null}
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
                {!counterWalkIn(clients) ? <option value="">{L('walkInClient')}</option> : null}
                {clients.map(c => <option key={c.id} value={c.id}>{c.is_walk_in ? '🏪 ' : ''}{c.name}{c.price_tier === 'gros' ? ' (' + L('wholesale') + ')' : ''}</option>)}
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

      {waTicket ? (
        <WhatsAppModal L={L} kind="ticket" close={() => setWaTicket(null)}
          party={{ id: waTicket.clientId, name: waTicket.clientName, phone: waTicket.clientPhone, table: 'clients' }}
          buildVars={lang => ({
            societe: waTicket.company?.name || '', numero: waTicket.number, date: waTicket.date,
            articles: (waTicket.lines || []).map(l => '• ' + (lang === 'ar' && l.nomAr ? l.nomAr : l.nom) + ' × ' + fmt(l.qte) + ' = ' + dh(lineNet(l))).join('\n'),
            montant: dh(waTicket.totals?.totalTTC || 0), paiement: Lx(lang)('pm_' + waTicket.payMode) || waTicket.payMode,
            client: waTicket.clientName || '', telephone_societe: waTicket.company?.phone || ''
          })}
          pdfName={waTicket.number} auditModule="Caisse" auditObject={waTicket.number} />
      ) : null}
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
  const [showClosed, setShowClosed] = useState(false);
  const [search, setSearch] = useState('');
  const [[from, to], setRange] = useState(['', '']);
  const [payF, setPayF] = useState('all');
  const [err, setErr] = useState('');
  const [userFilter, setUserFilter] = useState(getSelectedUserFilter(type));

  async function load() {
    try {
      const session = getStoredSession();
      // V53 : clients / fournisseurs communs à plusieurs drogueries
      const partiesQuery = supabase.from(isSales ? 'clients' : 'suppliers').select('*').order('name');

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
      // Vendeur : uniquement ses clients (affectés à lui ou créés par lui) + fiche comptoir. Admin/Gérant : tous.
      const docBranch = isAdmin(session) ? selectedBranchId(session) : branchId(session);
      setParties((party || []).filter(x => partyInBranch(x, docBranch) && canSeePartyRecord(x, isSales ? 'clients' : 'suppliers', session))
        .sort((a, b) => Number(!!b.is_walk_in) - Number(!!a.is_walk_in)));
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, [type]);

  const tabs = isSales
    ? [['all', L('all')], ['devis', L('quotes')], ['commande', L('orders')], ['livraison', L('deliveries')], ['facture', L('invoices')], ['avoir', L('creditNotes')]]
    : [['all', L('all')], ['commande', L('orders')], ['reception', L('receipts')], ['facture', L('invoices')], ['retour', L('supplierReturns')]];

  // V52 : les BL / BR sont toujours « clôturés » côté stock → ils restent affichés (avant : onglet Réceptions vide)
  const filtered = applyUserFilterToRows((tab === 'all' ? rows : rows.filter(x => x.stage === tab)).filter(x => {
    if (tab === 'commande' && docStatus(x) === 'closed' && !showClosed) return false;
    // V55 : recherche, période, règlement
    if (!inPeriod(x.date, from, to)) return false;
    if (payF !== 'all' && (x.stage !== 'facture' || (payF === 'unpaid' ? x.statutPaiement === 'paid' : x.statutPaiement !== payF))) return false;
    return matchSearch(search, [docNo(x), ...Object.values(jsonValue(x.numbers_json, {})), x.client_name, x.supplier_name, x.createdByLabel, x.supplier_ref,
      ...(x.lignes || []).map(l => (l.nom || '') + ' ' + (l.ref || '')), String(Math.round(Number(x.totalTTC || 0)))]);
  }), type);
  const [shown, more] = useShowMore(filtered, 50);
  const totalShown = filtered.filter(d => !isReturnDoc(d)).reduce((t, d) => t + Number(d.totalTTC || 0), 0);
  const restShown = filtered.filter(d => d.stage === 'facture').reduce((t, d) => t + Number(d.reste || 0), 0);
  // V55 : « + Nouveau » depuis n'importe quel écran
  useEffect(() => {
    if (!parties.length && !products.length) return;
    const a = takeQuickAction(type);
    if (a && canWriteDoc) create(a);
  }, [parties.length, products.length]);
  const childrenOf = id => rows.filter(x => String(x.base_doc_id || '') === String(id));
  const openReceive = d => setPartial({ doc: d, date: today(), supplierRef: '', lignes: docRemainingLines(d).filter(l => Number(l.remainingQty || 0) > 0).map(l => ({ ...l, qteToProcess: Number(l.remainingQty || 0), excluded: false })) });
  const openInvoice = d => setPartial({ mode: 'invoice', doc: d, date: today(), supplierRef: '', dueDate: '', lignes: docInvoiceRemainingLines(d).filter(l => Number(l.remainingQty || 0) > 0).map(l => ({ ...l, qteToProcess: Number(l.remainingQty || 0), excluded: false })) });

  function create(start) {
    setForm({ start, date: today(), partyId: (parties.find(p => !p.is_walk_in) || parties[0])?.id || '', lignes: [{ produitId: products[0]?.id || '', qte: 1 }] });
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
        forceCredit: !!opts.forceCredit,
        ...(isSales ? {} : { supplierRef: form.supplierRef || '', dueDate: form.dueDate || '' })
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
        forceCredit: !!opts.forceCredit,
        supplierRef: partial.supplierRef || '',
        dueDate: partial.dueDate || ''
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
        <ExportButtons L={L} spec={() => {
          const party = d => d.client_name || d.supplier_name || d.clientNom || d.fournisseurNom || '';
          const tabLabel = (tabs.find(t => t[0] === tab) || [])[1] || '';
          return {
            fileName: isSales ? 'Ventes' : 'Achats', title: (isSales ? L('sales') : L('purchases')) + (tab !== 'all' ? ' — ' + tabLabel : ''),
            sheets: [
              { name: isSales ? L('sales') : L('purchases'), columns: [
                { value: d => docNo(d), header: 'N°' }, { value: d => docTypeLabel(d, type, L), header: L('docType') },
                { key: 'date', header: L('date'), type: 'date' }, { value: party, header: isSales ? L('customer') : L('supplier') },
                { key: 'createdByLabel', header: L('createdBy') },
                { value: d => docStatus(d) === 'closed' ? L('closed') : docStatus(d) === 'partial' ? L('partial') : L('open'), header: L('status') },
                { key: 'totalHT', header: L('totalHT'), type: 'money' }, { key: 'tva', header: L('totalVAT'), type: 'money' },
                { key: 'totalTTC', header: L('totalTTC'), type: 'money' },
                { value: d => d.stage === 'facture' ? Number(d.totalTTC || 0) - Number(d.reste || 0) : null, header: L('totalPaid'), type: 'money' },
                { value: d => d.stage === 'facture' ? Number(d.reste || 0) : null, header: L('remaining'), type: 'money' },
                { value: d => d.stage === 'facture' ? (d.statutPaiement === 'paid' ? L('paid') : d.statutPaiement === 'partial' ? L('partial') : L('unpaid')) : '', header: L('payment') },
                { value: d => d.baseDocId ? (d.baseDocNumber || ('#' + d.baseDocId)) : '', header: L('baseDocNo') },
                ...(isSales ? [] : [{ key: 'supplier_ref', header: L('supplierRef') }, { key: 'due_date', header: L('dueDate'), type: 'date' }])
              ], rows: tab === 'reception' && !isSales ? applyUserFilterToRows(rows, type).filter(d => d.stage === 'reception' || (d.stage === 'facture' && jsonValue(d.numbers_json, {}).reception)) : filtered },
              { name: L('documentLines'), columns: [
                { value: x => docNo(x.d), header: 'N°' }, { value: x => x.d.date, header: L('date'), type: 'date' }, { value: x => party(x.d), header: isSales ? L('customer') : L('supplier') },
                { value: x => x.l.ref, header: L('ref') }, { value: x => x.l.nom, header: L('product') }, { value: x => x.l.unite, header: L('unit') },
                { value: x => Number(x.l.qte || 0), header: L('quantity'), type: 'qty', total: true },
                { value: x => Number(x.l.prixUnit || 0), header: L('unitPrice'), type: 'money', total: false },
                { value: x => lineDiscount(x.l) || null, header: L('discount'), type: 'number', total: false },
                { value: x => lineNet(x.l), header: L('totalTTC'), type: 'money' }
              ], rows: (tab === 'reception' && !isSales ? applyUserFilterToRows(rows, type).filter(d => d.stage === 'reception' || (d.stage === 'facture' && jsonValue(d.numbers_json, {}).reception)) : filtered).flatMap(d => (d.lignes || []).map(l => ({ d, l }))) }
            ]
          };
        }} />
      </Header>

      <div className="flex gap-1 mb-4 flex-wrap items-center">
        {tabs.map(t => <button key={t[0]} onClick={() => setTab(t[0])} className={'px-3 py-1.5 rounded-lg text-sm ' + (tab === t[0] ? 'bg-slate-800 text-white' : 'bg-white border text-slate-500')}>{t[1]}</button>)}
        {tab === 'commande' ? (
          <label className="text-xs text-slate-500 flex items-center gap-1 ms-3"><input type="checkbox" checked={showClosed} onChange={e => setShowClosed(e.target.checked)} /> {L('showClosedDocs')}</label>
        ) : null}
      </div>

      {isSales || tab !== 'reception' ? (
        <ListToolbar L={L} search={search} setSearch={setSearch} from={from} to={to} setPeriod={(f, t) => setRange([f, t])}
          count={filtered.length} onReset={() => { setSearch(''); setRange(['', '']); setPayF('all'); }}>
          {tab === 'all' || tab === 'facture' ? (
            <select className="input list-select" aria-label={L('payment')} value={payF} onChange={e => setPayF(e.target.value)}>
              <option value="all">{L('payment')} : {L('all')}</option>
              <option value="unpaid">{L('unpaid')} / {L('partial')}</option>
              <option value="partial">{L('partial')}</option>
              <option value="paid">{L('paid')}</option>
            </select>
          ) : null}
          <span className="text-xs text-slate-500 whitespace-nowrap">{L('totalTTC')} <b className="text-slate-900">{dh(totalShown)}</b>{restShown > 0.009 ? <> · {L('remaining')} <b className="text-red-700">{dh(restShown)}</b></> : null}</span>
        </ListToolbar>
      ) : null}

      {!isSales && tab === 'reception' ? (
        <PurchaseReceptionsView L={L} rows={applyUserFilterToRows(rows, type)} allRows={rows}
          canWriteDoc={canWriteDoc} canDeleteDoc={canDeleteDoc}
          onPreview={setPreview} onInvoice={openInvoice} onDelete={remove}
          onEdit={d => setForm({ id: d.id, start: d.stage, date: d.date, partyId: d.supplier_id, supplierRef: d.supplier_ref || '', dueDate: d.due_date || '', lignes: (d.lignes || []).map(l => ({ produitId: l.produitId, qte: l.qte, prixUnit: l.prixUnit, remise: l.remise || 0 })) })} />
      ) : (
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
          {shown.map(d => {
            const status = d.statutPaiement === 'paid' ? L('paid') : d.statutPaiement === 'partial' ? L('partial') : L('unpaid');
            const tone = d.statutPaiement === 'paid' ? 'green' : d.statutPaiement === 'partial' ? 'amber' : 'red';
            return (
              <tr key={d.id}>
                <td><Badge tone="blue">{docTypeLabel(d, type, L)}</Badge></td>
                <td className="font-mono text-xs font-bold"><button type="button" className="doc-link" onClick={() => setPreview(d)} title={L('preview')}>{docNo(d)}</button></td>
                <td>{d.baseDocId ? <Badge tone="slate">{d.baseDocNumber || ('#' + d.baseDocId)}</Badge> : '-'}</td>
                <td>
                  <div className="font-semibold">{d.createdByLabel || '-'}</div>
                  <div className="text-xs text-slate-400">{L('createdBy')}</div>
                </td>
                <td className="whitespace-nowrap">{frDate(d.date)}</td>
                <td>
                  <div className="font-semibold">{d.client_name || d.supplier_name || d.clientNom || d.fournisseurNom}</div>
                  <div className="text-xs text-slate-400">{isSales ? L('customer') : L('supplier')}</div>
                </td>
                <td>{(() => { const st = docStatusView(d, type, L); return <Badge tone={st.tone}>{st.label}</Badge>; })()}</td>
                <td className="text-xs">
                  <div>{L('quantity')}: <b>{docQty(d.lignes)}</b></div>
                  <div>{L('remainingQty')}: <b>{docRemainingQty(d)}</b></div>
                  {(d.stage === 'livraison' || d.stage === 'reception') ? <div className={docInvoiceRemainingQty(d) > 0 ? 'text-amber-600' : 'text-emerald-600'}>{L('invoicedQty')}: <b>{fmt(docInvoicedQty(d))} / {fmt(docQty(d.lignes))}</b></div> : null}
                  {!isSales && d.stage === 'commande' ? (
                    <div className="mt-1">
                      <div>{L('receivedQty')}: <b>{fmt(docQty(d.lignes) - docRemainingQty(d))} / {fmt(docQty(d.lignes))}</b></div>
                      <div className="rc-progress"><span style={{ width: Math.min(100, (docQty(d.lignes) ? (docQty(d.lignes) - docRemainingQty(d)) / docQty(d.lignes) * 100 : 0)) + '%' }} /></div>
                      {childrenOf(d.id).filter(x => x.stage === 'reception').map(x => <div key={x.id} className="text-slate-500 font-mono">↳ {docNo(x)} · {frDate(x.date)}</div>)}
                    </div>
                  ) : null}
                  {!isSales && d.supplier_ref ? <div className="text-slate-500">{L('supplierRef')}: <b>{d.supplier_ref}</b></div> : null}
                  {isReturnDoc(d) ? <div className="text-emerald-700">{L('imputed')}: <b>{dh(d.imputed_amount || 0)}</b></div> : null}
                  {isReturnDoc(d) && Number(d.totalTTC || 0) - Number(d.imputed_amount || 0) > 0.01 ? <div className="text-red-600">{isSales ? L('toRefund') : L('toReceive')}: <b>{dh(Number(d.totalTTC || 0) - Number(d.imputed_amount || 0))}</b></div> : null}
                  {isReturnDoc(d) && d.restocked === false ? <div className="text-slate-400">{L('noRestock')}</div> : null}
                </td>
                <td className="font-mono font-bold">{dh(d.totalTTC)}</td>
                {tab === 'facture' ? <td><Badge tone={tone}>{status}{d.reste > 0 ? ' · ' + L('remaining') + ' ' + dh(d.reste) : ''}</Badge></td> : null}
                <td>
                  {(() => {
                    // V55 : une action principale visible, les autres dans le menu « ⋯ »
                    const payIt = () => setPay({ ...d, date: today(), mode: 'Espèces', montant: d.reste || d.totalTTC, cashRegister: '', receiptNo: '', chequeNo: '', bank: '', dueDate: '', paymentStatus: 'En portefeuille', transferRef: '', valueDate: '', terminal: '', transactionNo: '', billNo: '', note: '' });
                    const acts = [
                      canWriteDoc && !isSales && d.stage === 'commande' && docRemainingQty(d) > 0 && { icon: '📦', label: L('receiveAction'), onClick: () => openReceive(d), main: true },
                      canWriteDoc && !isSales && d.stage === 'reception' && docInvoiceRemainingQty(d) > 0 && { icon: '🧾', label: L('invoiceAction'), onClick: () => openInvoice(d), main: true },
                      canWriteDoc && isSales && !isReturnDoc(d) && d.stage !== 'facture' && { icon: '➜', label: L('advance'), onClick: () => advance(d.id), main: true },
                      canPayDoc && paymentButtonVisible(d) && { icon: '💳', label: L('pay'), onClick: payIt, main: true, pay: true },
                      { icon: '👁', label: L('preview'), onClick: () => setPreview(d) },
                      canWriteDoc && isSales && d.stage !== 'facture' && !isReturnDoc(d) && docRemainingQty(d) > 0 && { icon: '🚚', label: L('partialDelivery'), onClick: () => setPartial({ doc: d, date: today(), lignes: docRemainingLines(d).map(l => ({ ...l, qteToProcess: Number(l.remainingQty || 0), excluded: false })) }) },
                      canWriteDoc && isSales && canPartialInvoice(d, type) && { icon: '🧾', label: L('partialInvoice'), onClick: () => setPartial({ mode: 'invoice', doc: d, date: today(), lignes: docInvoiceRemainingLines(d).filter(l => Number(l.remainingQty || 0) > 0).map(l => ({ ...l, qteToProcess: Number(l.remainingQty || 0), excluded: false })) }) },
                      canWriteDoc && canUse(isSales ? 'sales.return' : 'purchases.return') && canReturnDoc(d) && { icon: '↩', label: isSales ? L('creditNote') : L('supplierReturn'), onClick: () => setPartial({ mode: 'return', restock: true, doc: d, date: today(), lignes: docReturnRemainingLines(d).filter(l => Number(l.remainingQty || 0) > 0).map(l => ({ ...l, qteToProcess: 0, excluded: false })) }) },
                      canWriteDoc && !isReturnDoc(d) && { icon: '✏️', label: L('edit'), onClick: () => setForm({ id: d.id, start: d.stage, date: d.date, partyId: isSales ? d.client_id : d.supplier_id, supplierRef: d.supplier_ref || '', dueDate: d.due_date || '', lignes: (d.lignes || []).map(l => ({ produitId: l.produitId, qte: l.qte, prixUnit: l.prixUnit, remise: l.remise || 0 })) }) },
                      canDeleteDoc && { icon: '🗑', label: L('del'), onClick: () => remove(d.id), tone: 'danger' }
                    ].filter(Boolean);
                    const main = acts.find(x => x.main) || acts[0];
                    return (
                      <div className="flex gap-1 items-center flex-nowrap">
                        {main ? <button onClick={main.onClick} className={'btn whitespace-nowrap ' + (main.pay ? 'bg-emerald-600 text-white' : main.main ? 'bg-slate-800 text-white' : 'bg-white border')}>{main.icon} {main.label}</button> : null}
                        <RowMenu L={L} items={acts.filter(x => x !== main)} />
                      </div>
                    );
                  })()}
                </td>
              </tr>
            );
          })}
          {!filtered.length ? <tr><td colSpan="11" className="text-center text-slate-500 py-6">{L('noData')}</td></tr> : null}
        </tbody>
      </Table>
      )}
      {isSales || tab !== 'reception' ? <ShowMore L={L} more={more} shown={shown.length} total={filtered.length} /> : null}

      {form ? <DocModal L={L} isSales={isSales} form={form} setForm={setForm} products={products} parties={parties} save={save} close={() => setForm(null)} /> : null}
      {pay ? <PaymentModal L={L} isSales={isSales} pay={pay} setPay={setPay} save={settle} close={() => setPay(null)} /> : null}
      {partial ? <PartialModal L={L} isSales={isSales} partial={partial} setPartial={setPartial} save={doPartial} close={() => setPartial(null)} /> : null}
      {preview ? <DocumentPreview L={L} isSales={isSales} doc={preview} close={() => setPreview(null)} /> : null}
    </>
  );
}

/* ---------- V52 : statut lisible d'un document ---------- */
function docStatusView(d, type, L) {
  const isSales = type === 'sales';
  if (isReturnDoc(d)) return { label: L('closed'), tone: 'green' };
  if (d.stage === 'facture') {
    return d.statutPaiement === 'paid' ? { label: L('paid'), tone: 'green' } : d.statutPaiement === 'partial' ? { label: L('partial'), tone: 'amber' } : { label: L('unpaid'), tone: 'red' };
  }
  if (d.stage === 'livraison' || d.stage === 'reception') {
    const total = docQty(d.lignes || jsonValue(d.lines_json, [])), inv = docInvoicedQty(d);
    if (inv <= 0.0001) return { label: L('rcToInvoice'), tone: 'blue' };
    if (inv < total - 0.0001) return { label: L('rcPartial'), tone: 'amber' };
    return { label: L('rcInvoiced'), tone: 'green' };
  }
  const st = docStatus(d);
  if (!isSales && d.stage === 'commande') {
    return st === 'closed' ? { label: L('poReceived'), tone: 'green' } : st === 'partial' ? { label: L('poPartial'), tone: 'amber' } : { label: L('poOpen'), tone: 'blue' };
  }
  return st === 'closed' ? { label: L('closed'), tone: 'green' } : st === 'partial' ? { label: L('partial'), tone: 'amber' } : { label: L('open'), tone: 'blue' };
}

/* ---------- V52 : onglet Réceptions (achats) ---------- */
function receptionInfo(d, allRows, byId) {
  const lines = normalizeLines(jsonValue(d.lines_json || d.lignes, []));
  const total = docQty(lines);
  const nums = jsonValue(d.numbers_json, {});
  const parent = d.base_doc_id ? byId[String(d.base_doc_id)] : null;
  const order = parent ? (docNo(parent, 'commande') || docNo(parent)) : (nums.commande || '');
  let invoiced, invoices, invLines;
  if (d.stage === 'facture') {
    invoiced = total; invoices = [{ id: d.id, number: nums.facture || docNo(d), doc: d }];
    invLines = lines.map(l => ({ ...l, processedQty: Number(l.qte || 0), remainingQty: 0 }));
  } else {
    invoiced = Math.min(total, docInvoicedQty(d));
    invoices = allRows.filter(x => String(x.base_doc_id || '') === String(d.id) && x.stage === 'facture').map(x => ({ id: x.id, number: docNo(x), doc: x }));
    invLines = docInvoiceRemainingLines(d);
  }
  const remainingHT = invLines.reduce((s, l) => s + lineNet({ ...l, qte: Number(l.remainingQty || 0) }), 0);
  const status = invoiced <= 0.0001 ? 'toInvoice' : invoiced < total - 0.0001 ? 'partial' : 'invoiced';
  return { d, number: nums.reception || docNo(d), order, total, invoiced, invoices, invLines, remainingHT, status };
}

function PurchaseReceptionsView({ L, rows, allRows, canWriteDoc, canDeleteDoc, onPreview, onInvoice, onEdit, onDelete }) {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState({});
  const byId = Object.fromEntries(allRows.map(d => [String(d.id), d]));
  const recs = rows
    .filter(d => d.stage === 'reception' || (d.stage === 'facture' && jsonValue(d.numbers_json, {}).reception))
    .map(d => receptionInfo(d, allRows, byId))
    .sort((a, b) => String(b.d.date || '').localeCompare(String(a.d.date || '')) || Number(b.d.id) - Number(a.d.id));
  const needle = q.trim().toLowerCase();
  const shown = recs.filter(r => (filter === 'all' || r.status === filter) && (!needle || [r.number, r.order, r.d.supplier_name, r.d.supplier_ref, ...r.invoices.map(x => x.number), ...(r.d.lignes || []).map(l => l.nom + ' ' + l.ref)].join(' ').toLowerCase().includes(needle)));
  const tone = { toInvoice: 'blue', partial: 'amber', invoiced: 'green' };
  const label = { toInvoice: L('rcToInvoice'), partial: L('rcPartial'), invoiced: L('rcInvoiced') };
  const count = k => recs.filter(r => r.status === k).length;
  return (
    <>
      <div className="pro-kpi-grid mb-4">
        <div className="pro-kpi-card"><span>{L('rcCount')}</span><b>{shown.length}</b><small>{L('receipts')}</small></div>
        <div className="pro-kpi-card"><span>{L('rcReceivedValue')}</span><b>{dh(shown.reduce((s, r) => s + Number(r.d.totalHT || 0), 0))}</b><small>{L('totalHT')}</small></div>
        <div className="pro-kpi-card"><span>{L('rcToInvoiceValue')}</span><b>{dh(shown.reduce((s, r) => s + r.remainingHT, 0))}</b><small>{L('rcToInvoice')}</small></div>
        <div className="pro-kpi-card"><span>{L('rcToInvoiceCount')}</span><b>{count('toInvoice') + count('partial')}</b><small>{L('rcPartial')} : {count('partial')}</small></div>
      </div>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        {[['all', L('all') + ' (' + recs.length + ')'], ['toInvoice', label.toInvoice + ' (' + count('toInvoice') + ')'], ['partial', label.partial + ' (' + count('partial') + ')'], ['invoiced', label.invoiced + ' (' + count('invoiced') + ')']].map(([k, t]) => (
          <button key={k} onClick={() => setFilter(k)} className={'px-3 py-1.5 rounded-full text-xs font-semibold ' + (filter === k ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600')}>{t}</button>
        ))}
        <input className="input max-w-xs ms-auto" placeholder={'🔎 ' + L('rcSearch')} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="card overflow-auto">
        <table className="table w-full rc-table">
          <thead>
            <tr>
              <th></th>
              <th>{L('rcNumber')}</th>
              <th>{L('date')}</th>
              <th>{L('supplier')}</th>
              <th>{L('supplierBlRef')}</th>
              <th>{L('rcOrder')}</th>
              <th>{L('rcArticles')}</th>
              <th>{L('totalHT')}</th>
              <th>{L('totalTTC')}</th>
              <th>{L('rcInvoicing')}</th>
              <th>{L('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(r => {
              const d = r.d, isOpen = !!open[d.id];
              return (
                <React.Fragment key={d.id}>
                  <tr className={isOpen ? 'rc-open' : ''}>
                    <td><button className="rc-toggle" title={L('rcDetails')} onClick={() => setOpen({ ...open, [d.id]: !isOpen })}>{isOpen ? '▾' : '▸'}</button></td>
                    <td className="font-mono text-xs font-bold whitespace-nowrap">{r.number}</td>
                    <td className="whitespace-nowrap">{frDate(d.date)}</td>
                    <td><div className="font-semibold">{d.supplier_name || '-'}</div><div className="text-xs text-slate-400">{d.createdByLabel || ''}</div></td>
                    <td className="font-mono text-xs whitespace-nowrap">{d.supplier_ref || '-'}</td>
                    <td className="font-mono text-xs whitespace-nowrap">{r.order || '-'}</td>
                    <td className="text-xs whitespace-nowrap">{(d.lignes || []).length} {L('rcLines')} · <b>{fmt(r.total)}</b></td>
                    <td className="font-mono whitespace-nowrap">{dh(d.totalHT)}</td>
                    <td className="font-mono font-bold whitespace-nowrap">{dh(d.totalTTC)}</td>
                    <td>
                      <Badge tone={tone[r.status]}>{label[r.status]}</Badge>
                      <div className="text-xs text-slate-500 mt-1 whitespace-nowrap">{fmt(r.invoiced)} / {fmt(r.total)}</div>
                      <div className="rc-progress"><span style={{ width: (r.total ? Math.min(100, r.invoiced / r.total * 100) : 0) + '%' }} /></div>
                      {r.invoices.map(x => <button key={x.id} onClick={() => onPreview(x.doc)} className="block text-xs text-sky-700 underline font-mono whitespace-nowrap">{x.number}</button>)}
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => onPreview(d)} className="btn bg-white border">{L('preview')}</button>
                        {canWriteDoc && d.stage === 'reception' && r.status !== 'invoiced' ? <button onClick={() => onInvoice(d)} className="btn bg-slate-800 text-white">🧾 {L('invoiceAction')}</button> : null}
                        {canWriteDoc && d.stage === 'reception' && !r.invoices.length ? <button onClick={() => onEdit(d)} className="btn bg-white border">{L('edit')}</button> : null}
                        {canDeleteDoc && d.stage === 'reception' && !r.invoices.length ? <button onClick={() => onDelete(d.id)} className="btn bg-red-600 text-white">{L('del')}</button> : null}
                      </div>
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="rc-detail">
                      <td></td>
                      <td colSpan="10">
                        <table className="w-full text-xs">
                          <thead><tr><th>{L('ref')}</th><th>{L('product')}</th><th>{L('receivedQty')}</th><th>{L('unitPriceHT')}</th><th>{L('totalHT')}</th><th>{L('invoicedQty')}</th><th>{L('rcToInvoice')}</th></tr></thead>
                          <tbody>
                            {r.invLines.map((l, i) => (
                              <tr key={i}>
                                <td className="font-mono">{l.ref || '-'}</td>
                                <td>{l.nom}</td>
                                <td>{fmt(l.qte)} {l.unite || ''}</td>
                                <td>{dh(l.prixUnit)}</td>
                                <td>{dh(lineNet(l))}</td>
                                <td>{fmt(l.processedQty)}</td>
                                <td className={Number(l.remainingQty) > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>{fmt(l.remainingQty)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
            {!shown.length ? <tr><td colSpan="11" className="text-center text-slate-500 py-6">{L('rcNone')}</td></tr> : null}
          </tbody>
        </table>
      </div>
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
        {!isSales && ['reception', 'facture'].includes(form.start) ? (
          <label className="text-xs text-slate-500">{form.start === 'facture' ? L('supplierInvRef') : L('supplierBlRef')}
            <input className="input mt-1" value={form.supplierRef || ''} onChange={e => setForm({ ...form, supplierRef: e.target.value })} placeholder="Ex. : BL-4587" />
          </label>
        ) : null}
        {!isSales && form.start === 'facture' ? (
          <label className="text-xs text-slate-500">{L('dueDate')}
            <input type="date" className="input mt-1" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </label>
        ) : null}
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
              <th>{isSales ? L('unitPrice') : L('unitPriceHT')}</th>
              <th>{L('discount')} %</th>
              <th>{isSales ? L('totalTTC') : L('totalHT')}</th>
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
        {isSales ? (
          <div className="text-right">
            <p className="text-xs text-slate-400">{L('totalTTC')}</p>
            <p className="text-xl font-black">{dh(total)}</p>
          </div>
        ) : (
          <div className="text-right text-sm">
            <p className="text-slate-500">{L('totalHT')} : <b>{dh(total)}</b> · {L('totalVAT')} : <b>{dh(total * 0.2)}</b></p>
            <p className="text-xs text-slate-400 mt-1">{L('totalTTC')}</p>
            <p className="text-xl font-black">{dh(total * 1.2)}</p>
          </div>
        )}
      </div>

      <button onClick={save} className="btn bg-amber-500 mt-4">{L('save')}</button>
      </>
      )}
    </Modal>
  );
}


/* ===================== Partage PDF (WhatsApp / e-mail) ===================== */
// V52 : elementToPdfBlob est défini avec la charte graphique (rendu A4 fixe, coupes entre lignes)

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

  const c = company || { name: getBrand().name || 'DrogueriePro', logo: getBrand().logo };
  const third = isSales ? (doc.client_name || doc.clientName || '-') : (doc.supplier_name || doc.supplierName || '-');
  const docTitle = preciseDocTitle(doc, type, L);
  const vatRate = Number(doc.vat_rate || 20);
  const areaRef = useRef(null);
  const [contact, setContact] = useState({ phone: '' });
  const [sharing, setSharing] = useState(false);
  const [wa, setWa] = useState(false);
  const partyTable = isSales ? 'clients' : 'suppliers';
  const partyId = isSales ? doc.client_id : doc.supplier_id;
  useEffect(() => {
    if (!partyId) return;
    supabase.from(partyTable).select('phone').eq('id', partyId).maybeSingle().then(({ data }) => setContact({ phone: data?.phone || '' }));
  }, [doc?.id]);
  const fileName = (docNo(doc) || 'document').replace(/[^\w.-]+/g, '_') + '.pdf';

  async function share(channel) {
    if (!areaRef.current) return;
    setSharing(true);
    try {
      const blob = await elementToPdfBlob(areaRef.current);
      const msg = docShareMessage(doc, docTitle, c.name, isSales);
      const file = typeof File !== 'undefined' ? new File([blob], fileName, { type: 'application/pdf' }) : null;
      if (channel === 'pdf') {
        downloadBlobFile(blob, fileName);
      } else if (channel === 'native' && file && navigator.canShare && navigator.canShare({ files: [file] })) {
        // Téléphone : la feuille de partage propose WhatsApp, Gmail… avec le PDF joint
        await navigator.share({ files: [file], title: docTitle + ' ' + docNo(doc), text: msg }).catch(() => {});
      } else if (channel === 'email') {
        downloadBlobFile(blob, fileName);
        window.location.href = 'mailto:?subject=' + encodeURIComponent(docTitle + ' ' + docNo(doc) + ' — ' + (c.name || '')) + '&body=' + encodeURIComponent(msg);
      }
      auditLog(isSales ? 'Ventes' : 'Achats', 'SHARE', docNo(doc), 'Partage ' + channel);
    } catch (e) { alert(e.message); }
    setSharing(false);
  }
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;
  const info = paymentInfo(doc);
  const waVars = lang => {
    const T = Lx(lang);
    const title = preciseDocTitle(doc, type, T);
    return {
      client: third === '-' ? '' : third,
      document: lang === 'fr' ? title.charAt(0).toLowerCase() + title.slice(1) : title,
      numero: docNo(doc), date: frDate(doc.date || today()), montant: dh(doc.totalTTC || doc.total_ttc || 0),
      reste: doc.stage === 'facture' && Number(info.rest || 0) > 0.009 ? dh(info.rest) : '',
      societe: c.name || '', telephone_societe: c.phone || ''
    };
  };
  const hasDiscount = (doc.lignes || []).some(l => lineDiscount(l) > 0);

  return (
    <Modal title={L('preview')} onClose={close} wide>
      <div className="print-area simple-document" ref={areaRef} style={docStyle(c)}>
        <DocBrandHeader L={L} company={c} title={docTitle} number={docNo(doc)} date={frDate(doc.date || today())} />

        <div className="simple-doc-meta">
          <div>
            <span>{isSales ? L('customer') : L('supplier')}</span>
            <b>{third}</b>
          </div>
          <div>
            <span>{doc.stage === 'facture' ? L('payment') : L('status')}</span>
            <b>{doc.stage === 'facture' ? paymentLabel(doc, L) : docStatusView(doc, isSales ? 'sales' : 'purchases', L).label}</b>
          </div>
          {!isSales && doc.supplier_ref ? (
            <div>
              <span>{doc.stage === 'facture' ? L('supplierInvRef') : L('supplierBlRef')}</span>
              <b>{doc.supplier_ref}</b>
            </div>
          ) : null}
          {!isSales && doc.stage === 'facture' && doc.due_date ? (
            <div>
              <span>{L('dueDate')}</span>
              <b>{frDate(doc.due_date)}</b>
            </div>
          ) : null}
          <div>
            <span>{L('createdBy')}</span>
            <b>{doc.createdByLabel && doc.createdByLabel !== '-' ? doc.createdByLabel : (doc.created_by_label || '-')}</b>
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
              <th>{isSales ? L('unitPrice') : L('unitPriceHT')}</th>
              {hasDiscount ? <th>{L('discount')}</th> : null}
              <th>{isSales ? L('totalTTC') : L('totalHT')}</th>
            </tr>
          </thead>
          <tbody>
            {(doc.lignes || []).map((l, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td className="font-mono">{l.ref || l.produitId || '-'}</td>
                <td>{l.nom || '-'}</td>
                <td>{fmt(l.qte)} {l.unite || ''}</td>
                <td>{dh(l.prixUnit)}</td>
                {hasDiscount ? <td>{lineDiscount(l) ? fmt(lineDiscount(l)) + ' %' : '-'}</td> : null}
                <td className="simple-bold">{dh(lineNet(l))}</td>
              </tr>
            ))}
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
        <DocFooterText company={c} />
      </div>

      <div className="flex flex-wrap justify-end gap-2 mt-4 no-print">
        {sharing ? <span className="text-sm text-slate-500 self-center">{L('pdfBuilding')}</span> : null}
        {featureOn('share') ? <button disabled={sharing} onClick={() => setWa(true)} className="btn wa-send" title={contact.phone || ''}>🟢 WhatsApp</button> : null}
        {canNativeShare && featureOn('share') ? <button disabled={sharing} onClick={() => share('native')} className="btn bg-amber-500">📤 {L('share')}</button> : null}
        {featureOn('share') ? <button disabled={sharing} onClick={() => share('email')} className="btn bg-white border">✉ {L('email')}</button> : null}
        <button disabled={sharing} onClick={() => share('pdf')} className="btn bg-white border">📄 PDF</button>
        <button onClick={() => window.print()} className="btn bg-slate-900 text-white">{L('print')}</button>
        <button onClick={close} className="btn bg-white border">{L('closeBtn')}</button>
      </div>
      {wa ? (
        <WhatsAppModal L={L} kind="doc" close={() => setWa(false)}
          party={{ id: partyId, name: third === '-' ? '' : third, phone: contact.phone, table: partyTable }}
          buildVars={waVars} makePdf={() => elementToPdfBlob(areaRef.current)}
          pdfFolder={isSales ? 'ventes' : 'achats'} pdfName={docNo(doc)}
          auditModule={isSales ? 'Ventes' : 'Achats'} auditObject={docNo(doc)} />
      ) : null}
    </Modal>
  );
}

function Payments({ L }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('active');
  const [typeF, setTypeF] = useState('all');
  const [modeF, setModeF] = useState('all');
  const [authorF, setAuthorF] = useState('all');
  const [search, setSearch] = useState('');
  const [[from, to], setRange] = useState(periodRange('month'));
  const [attach, setAttach] = useState(null);
  const [closure, setClosure] = useState(false);
  const attachEnabled = hasModuleAccess('attachments');

  async function load() {
    try {
      setErr('');
      const data = await loadPayments();
      setRows(data || []);
    } catch (e) {
      // V55 : l'erreur est affichée (avant : liste vide sans explication)
      setRows([]);
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  const modes = [...new Set(rows.map(p => p.mode).filter(Boolean))].sort();
  const authors = [...new Set(rows.map(p => p.createdByLabel).filter(Boolean))].sort();
  const filtered = rows.filter(p => {
    if (filter === 'active' && p.canceled) return false;
    if (filter === 'canceled' && !p.canceled) return false;
    if (typeF !== 'all' && p.type !== typeF) return false;
    if (modeF !== 'all' && p.mode !== modeF) return false;
    if (authorF !== 'all' && p.createdByLabel !== authorF) return false;
    if (!inPeriod(p.date, from, to)) return false;
    return matchSearch(search, [p.docNumber, p.tiers, p.mode, p.chequeNo, p.bank, p.transferRef, p.transactionNo, p.billNo, p.receiptNo, p.note, p.createdByLabel, String(p.montant)]);
  });
  const [shown, more] = useShowMore(filtered, 100);

  async function cancel(p) {
    if (!can('payments.cancel')) return alert('Autorisation insuffisante : payments.cancel');
    const reason = prompt('Motif annulation ?', 'Annulation règlement');
    if (reason === null) return;
    try {
      await cancelPayment(p.sourceTable, p.docId, p.id, reason);
      await load();
    } catch (e) { alert(e.message); }
  }

  const real = p => !p.canceled && p.mode !== 'Avoir';
  const cashIn = filtered.filter(p => p.type === 'encaissement' && real(p)).reduce((s, p) => s + Number(p.montant || 0), 0);
  const cashOut = filtered.filter(p => p.type === 'decaissement' && real(p)).reduce((s, p) => s + Number(p.montant || 0), 0);
  const canceledTotal = filtered.filter(p => p.canceled).reduce((s, p) => s + Number(p.montant || 0), 0);
  const byMode = {};
  filtered.filter(real).forEach(p => { const m = byMode[p.mode] || (byMode[p.mode] = { in: 0, out: 0, n: 0 }); m.n++; if (p.type === 'encaissement') m.in += Number(p.montant || 0); else m.out += Number(p.montant || 0); });

  return (
    <>
      <Header title={L('payments')}>
        <button onClick={load} className="btn bg-white border" aria-label="↻">↻</button>
        {canUse('cash.close') ? <button onClick={() => setClosure(true)} className="btn bg-amber-500">🧾 {L('cashClosure')}</button> : null}
        <ExportButtons L={L} spec={() => ({
          fileName: 'Paiements', title: L('payments'), period: from || to ? (frDate(from) || '…') + ' → ' + (frDate(to) || '…') : L('uxAll'),
          sheets: [{ name: L('payments'), columns: [
            { key: 'date', header: L('date'), type: 'date' },
            { value: p => p.type === 'encaissement' ? L('cashIn') : L('cashOut'), header: 'Type' },
            { key: 'docNumber', header: L('document') }, { key: 'tiers', header: L('customer') + ' / ' + L('supplier') },
            { key: 'mode', header: L('uxMode') },
            { value: p => [p.chequeNo, p.bank, p.transferRef, p.transactionNo, p.note].filter(Boolean).join(' · '), header: L('detail') },
            { value: p => p.type === 'encaissement' && !p.canceled ? Number(p.montant || 0) : null, header: L('cashIn'), type: 'money' },
            { value: p => p.type !== 'encaissement' && !p.canceled ? Number(p.montant || 0) : null, header: L('cashOut'), type: 'money' },
            { value: p => p.createdByLabel + (p.authorFromDoc ? ' (document)' : ''), header: L('createdBy') },
            { value: p => p.createdAt || '', header: L('date') + ' / heure', type: 'datetime' },
            { value: p => p.canceled ? L('canceled') + ' — ' + (p.canceledBy || '') + ' — ' + (p.cancelReason || '') : 'Actif', header: L('paymentStatus') }
          ], rows: filtered }]
        })} />
      </Header>

      {err ? <ErrorBox msg={err} /> : null}

      <ListToolbar L={L} search={search} setSearch={setSearch} from={from} to={to} setPeriod={(f, t) => setRange([f, t])}
        count={filtered.length} total={rows.length}
        onReset={() => { setSearch(''); setRange(['', '']); setFilter('active'); setTypeF('all'); setModeF('all'); setAuthorF('all'); }}>
        <select className="input list-select" aria-label="Type" value={typeF} onChange={e => setTypeF(e.target.value)}>
          <option value="all">{L('cashIn')} + {L('cashOut')}</option>
          <option value="encaissement">{L('cashIn')}</option>
          <option value="decaissement">{L('cashOut')}</option>
        </select>
        <select className="input list-select" aria-label={L('uxStatus')} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="active">Actifs</option>
          <option value="canceled">{L('canceled')}</option>
          <option value="all">{L('all')}</option>
        </select>
        <select className="input list-select" aria-label={L('uxMode')} value={modeF} onChange={e => setModeF(e.target.value)}>
          <option value="all">{L('uxMode')} : {L('all')}</option>
          {modes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="input list-select" aria-label={L('uxAuthor')} value={authorF} onChange={e => setAuthorF(e.target.value)}>
          <option value="all">{L('createdBy')} : {L('all')}</option>
          {authors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </ListToolbar>

      <div className="pro-kpi-grid mb-3">
        <div className="pro-kpi-card"><span>{L('kpiCashIn')}</span><b className="text-emerald-700">{dh(cashIn)}</b><small>{L('cashIn')}</small></div>
        <div className="pro-kpi-card"><span>{L('kpiCashOut')}</span><b className="text-red-700">{dh(cashOut)}</b><small>{L('cashOut')}</small></div>
        <div className="pro-kpi-card"><span>{L('uxNet')}</span><b>{dh(cashIn - cashOut)}</b><small>{filtered.length} {L('paymentList').toLowerCase()}</small></div>
        <div className="pro-kpi-card"><span>{L('canceled')}</span><b>{dh(canceledTotal)}</b><small>{L('cancelPayment')}</small></div>
      </div>
      {Object.keys(byMode).length ? (
        <div className="flex flex-wrap gap-2 mb-3 text-xs" aria-label={L('uxByMode')}>
          {Object.entries(byMode).sort((a, b) => (b[1].in + b[1].out) - (a[1].in + a[1].out)).map(([m, v]) => (
            <button key={m} type="button" onClick={() => setModeF(modeF === m ? 'all' : m)} className={'chip ' + (modeF === m ? 'chip-on' : '')}>
              <b>{m}</b> · {v.n} · {v.in ? '+' + fmt(v.in) : ''}{v.in && v.out ? ' / ' : ''}{v.out ? '-' + fmt(v.out) : ''}
            </button>
          ))}
        </div>
      ) : null}

      <Table>
        <thead>
          <tr>
            <th>{L('date')}</th>
            <th>Type</th>
            <th>{L('document')}</th>
            <th>{L('customer')} / {L('supplier')}</th>
            <th>{L('uxMode')}</th>
            <th>{L('totalTTC')}</th>
            <th>{L('createdBy')}</th>
            <th>{L('paymentStatus')}</th>
            <th>{L('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((p, i) => (
            <tr key={(p.sourceTable || '') + (p.docId || '') + '-' + (p.id || i)} className={p.canceled ? 'payment-canceled' : ''}>
              <td className="whitespace-nowrap">{frDate(p.date) || '-'}{p.createdAt ? <div className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div> : null}</td>
              <td><Badge tone={p.type === 'encaissement' ? 'green' : 'amber'}>{p.type === 'encaissement' ? L('cashIn') : L('cashOut')}</Badge></td>
              <td className="font-mono text-xs whitespace-nowrap">{p.docNumber || '-'}</td>
              <td>{p.tiers || '-'}</td>
              <td>
                <div>{p.mode || '-'}</div>
                <div className="text-xs text-slate-500">{[p.chequeNo, p.bank, p.transferRef, p.transactionNo, p.billNo, p.note].filter(Boolean).join(' · ')}</div>
              </td>
              <td className={'font-bold whitespace-nowrap ' + (p.type === 'encaissement' ? 'text-emerald-700' : 'text-red-700')}>{p.type === 'encaissement' ? '+' : '-'}{dh(p.montant || 0)}</td>
              <td>
                {p.createdByLabel ? (
                  p.authorFromDoc
                    ? <span className="text-slate-500 italic" title={L('uxAuthorFromDoc')}>{p.createdByLabel} <span aria-hidden="true">ⓘ</span></span>
                    : <Badge tone="blue">{p.createdByLabel}</Badge>
                ) : '-'}
              </td>
              <td>
                {p.canceled ? (
                  <>
                    <Badge tone="red">{L('canceled')}</Badge>
                    <div className="text-xs text-slate-500 mt-1">{L('uxCanceledBy')} {p.canceledBy || '-'}{p.canceledAt ? ' · ' + new Date(p.canceledAt).toLocaleDateString('fr-FR') : ''}</div>
                    {p.cancelReason ? <div className="text-xs text-slate-500">{L('uxReason')} : {p.cancelReason}</div> : null}
                  </>
                ) : <Badge tone="green">Actif</Badge>}
              </td>
              <td>
                <div className="flex gap-1 items-center">
                  {attachEnabled ? <button onClick={() => setAttach(p)} className="btn bg-white border" title={L('attach')} aria-label={L('attach')}>📎</button> : null}
                  {!p.canceled && p.mode !== 'Avoir' && can('payments.cancel') ? <button onClick={() => cancel(p)} className="btn bg-white border text-red-700">{L('cancelPayment')}</button> : null}
                </div>
              </td>
            </tr>
          ))}
          {!filtered.length ? <tr><td colSpan="9" className="text-center text-slate-500 py-6">{L('noData')}</td></tr> : null}
        </tbody>
      </Table>
      <ShowMore L={L} more={more} shown={shown.length} total={filtered.length} />

      {attach ? (
        <Modal title={L('attach') + ' — ' + (attach.docNumber || '') + ' · ' + dh(attach.montant || 0)} onClose={() => setAttach(null)}>
          <div className="text-sm text-slate-500 mb-2">{frDate(attach.date)} · {attach.mode} · {attach.tiers || '-'}</div>
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
  // V52 : réception / facturation fournisseur → prix HT modifiable, réf. fournisseur, échéance, totaux
  const purchaseMode = !isSales && partial.mode !== 'return';
  const priceOf = l => (l.prixUnitEdit !== undefined && l.prixUnitEdit !== '' ? Number(l.prixUnitEdit) : Number(l.prixUnit || 0));
  const setPrice = (i, v) => { const next = [...lines]; next[i] = { ...next[i], prixUnitEdit: v }; setPartial({ ...partial, lignes: next }); };
  const vatRate = Number(partial.doc?.vat_rate || 20);
  const ht = includedLines.reduce((s, l) => s + lineNet({ ...l, qte: Number(l.qteToProcess || 0), prixUnit: priceOf(l) }), 0);
  const modalTitle = purchaseMode
    ? (partial.mode === 'invoice' ? L('invoiceTitle') : L('receiveTitle')) + ' ' + docNo(partial.doc) + ' — ' + (partial.doc?.supplier_name || '')
    : partial.mode === 'invoice' ? L('partialInvoice') + ' — ' + docNo(partial.doc) : partial.mode === 'return' ? (isSales ? L('creditNote') : L('supplierReturn')) + ' — ' + docNo(partial.doc) : (isSales ? L('partialDelivery') : L('partialReceipt'));

  return (
    <Modal title={modalTitle} onClose={close} wide>
      {partial.mode === 'return' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-sm">
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={partial.restock !== false} onChange={e => setPartial({ ...partial, restock: e.target.checked })} />
            {isSales ? L('restockClient') : L('restockSupplier')}
          </label>
          <p className="text-xs text-slate-500 mt-1">{L('returnHint')}</p>
        </div>
      ) : null}
      <div className={purchaseMode ? 'grid md:grid-cols-3 gap-3' : ''}>
        <label className="text-xs text-slate-500 block">{L('date')}
          <input className="input mt-1 mb-3" type="date" value={partial.date || today()} onChange={e => setPartial({ ...partial, date: e.target.value })} />
        </label>
        {purchaseMode ? (
          <label className="text-xs text-slate-500 block">{partial.mode === 'invoice' ? L('supplierInvRef') : L('supplierBlRef')}
            <input className="input mt-1 mb-3" value={partial.supplierRef || ''} onChange={e => setPartial({ ...partial, supplierRef: e.target.value })} placeholder="Ex. : BL-4587" />
          </label>
        ) : null}
        {purchaseMode && partial.mode === 'invoice' ? (
          <label className="text-xs text-slate-500 block">{L('dueDate')}
            <input className="input mt-1 mb-3" type="date" value={partial.dueDate || ''} onChange={e => setPartial({ ...partial, dueDate: e.target.value })} />
          </label>
        ) : null}
      </div>

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
              {purchaseMode ? <th title={L('unitPriceHTHint')}>{L('unitPriceHT')}</th> : null}
              {purchaseMode ? <th>{L('totalHT')}</th> : null}
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
                    className="input"
                    style={{ minWidth: 80, maxWidth: 120 }}
                    type="number"
                    min="0"
                    max={Number(l.remainingQty || 0)}
                    step="0.01"
                    disabled={!!l.excluded}
                    value={l.qteToProcess ?? 0}
                    onChange={e => updateLine(i, e.target.value)}
                  />
                </td>
                {purchaseMode ? (
                  <td>
                    <input className="input" style={{ minWidth: 90, maxWidth: 120 }} type="number" min="0" step="0.01" disabled={!!l.excluded} title={L('unitPriceHTHint')}
                      value={l.prixUnitEdit !== undefined ? l.prixUnitEdit : Number(l.prixUnit || 0)} onChange={e => setPrice(i, e.target.value)} />
                  </td>
                ) : null}
                {purchaseMode ? <td className="font-semibold whitespace-nowrap">{l.excluded ? '-' : dh(lineNet({ ...l, qte: Number(l.qteToProcess || 0), prixUnit: priceOf(l) }))}</td> : null}
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
          {purchaseMode ? <div className="mt-1">{L('totalHT')} : <b>{dh(ht)}</b> · {L('totalVAT')} ({fmt(vatRate)}%) : <b>{dh(ht * vatRate / 100)}</b> · {L('totalTTC')} : <b className="text-slate-900">{dh(ht * (1 + vatRate / 100))}</b></div> : null}
        </div>
        <button disabled={totalToProcess <= 0} onClick={save} className="btn bg-amber-500 disabled:opacity-50">{purchaseMode ? '✔ ' + (partial.mode === 'invoice' ? L('invoiceAction') : L('receiveAction')) : L('save')}</button>
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
        <ExportButtons L={L} spec={() => ({
          fileName: 'Charges_deplacements', title: L('expensesMod'),
          sheets: [
            { name: L('trips'), columns: [
              { key: 'num_dep', header: L('tripNum') }, { key: 'date', header: L('date'), type: 'date' }, { key: 'label', header: L('tripLabel') },
              { key: 'destination', header: L('destination') }, { key: 'vehicle', header: L('vehicle') }, { key: 'manager', header: L('manager2') },
              { value: t => tripStats(t.id).grossMargin, header: L('grossMarginLbl'), type: 'money' },
              { value: t => tripStats(t.id).totalCharges, header: L('totalCharges'), type: 'money' },
              { value: t => tripStats(t.id).net, header: L('netMargin'), type: 'money' }
            ], rows: trips },
            { name: L('charges'), columns: [
              { key: 'num_chg', header: L('chargeNum') }, { key: 'date', header: L('date'), type: 'date' }, { key: 'category', header: L('chargeCat') },
              { key: 'label', header: L('tripLabel') }, { key: 'beneficiary', header: L('beneficiary') },
              { value: e => trips.find(t => String(t.id) === String(e.trip_id))?.num_dep || L('noTrip'), header: L('trip') },
              { key: 'amount', header: L('amount'), type: 'money' }
            ], rows: expenses }
          ]
        })} />
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
  const isClients = type === 'clients';
  const session = getStoredSession();
  const admin = isAdmin(session);
  const canWriteParty = can(isClients ? 'clients.write' : 'suppliers.write');
  const canDeleteParty = can(isClients ? 'clients.delete' : 'suppliers.delete');
  const canAssignParty = can(isClients ? 'clients.assign' : 'suppliers.write');
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(null);
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [err, setErr] = useState('');
  const [balances, setBalances] = useState({});
  const [dups, setDups] = useState(null);
  const [merge, setMerge] = useState(null);
  const [walkIns, setWalkIns] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [data, usersData, branchesData] = await Promise.all([loadParties(type, { list: true }), loadUsers(), loadBranches()]);
      setRows(data);
      setUsers(usersData);
      setBranches(branchesData);
      // V55 : « + Nouveau → Client / Fournisseur »
      if (takeQuickAction(type) === 'new' && can(type === 'clients' ? 'clients.write' : 'suppliers.write')) {
        setForm({ name: '', type: 'entreprise', ice: '', phone: '', city: '', address: '', contact: '', assigned_to: getStoredSession()?.user?.id || '', branch_id: currentBranchId() || branchesData[0]?.id || '', branch_ids: [], pos_visible: true });
      }
      let bal = await loadPartyBalances(type);
      if (!bal) {
        // Ancienne base (avant V53) : calcul limité aux documents visibles
        const { data: inv } = await supabase.from(isClients ? 'sales' : 'purchases').select(isClients ? 'client_id, branch_id, total_ttc, payments_json' : 'supplier_id, branch_id, total_ttc, payments_json').eq('stage', 'facture');
        bal = {};
        (inv || []).forEach(d => {
          const pid = isClients ? d.client_id : d.supplier_id; if (!pid) return;
          const e = bal[pid] || (bal[pid] = { outstanding: 0, invoiced: 0, byBranch: [] });
          const rest = Number(paymentInfo(d).rest || 0);
          e.outstanding += rest; e.invoiced += Number(d.total_ttc || 0); e.byBranch.push({ branchId: d.branch_id, outstanding: rest });
        });
      }
      setBalances(bal);
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, [type]);

  const branchName = id => branches.find(b => Number(b.id) === Number(id))?.name || '-';
  const scopeLabel = x => { const ids = partyBranchIds(x); return ids.length ? ids.map(branchName).join(', ') : L('pScopeAll'); };

  async function save(force = false) {
    if (!form.name || !String(form.name).trim()) return alert(L('name') + ' ?');
    setBusy(true);
    try {
      // V53 : doublon dans une autre droguerie ? On propose la fiche existante plutôt qu'une deuxième fiche.
      if (!form.id && !force) {
        const { data: found, error } = await supabase.rpc('app_find_party_duplicates', { p_type: type, p_name: form.name, p_ice: form.ice || '', p_phone: form.phone || '', p_exclude: null });
        if (!error && (found || []).length) { setDups(found); setBusy(false); return; }
      }
      await saveParty(type, form);
      setForm(null); setDups(null);
      load();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }

  async function useExisting(d, share) {
    setBusy(true);
    try {
      if (share || !d.visible) {
        const { error } = await supabase.rpc('app_share_party', { p_type: type, p_id: d.id });
        if (error) throw new Error(error.message);
        await auditLog(isClients ? 'Clients' : 'Fournisseurs', 'UPDATE', d.name, 'Fiche rendue disponible dans la droguerie');
      }
      setForm(null); setDups(null);
      await load();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }

  async function remove(x) {
    if (!canDeleteParty) return alert('Suppression non autorisée');
    if (!confirm('Supprimer ?')) return;
    try {
      await deleteParty(type, x.id);
      load();
    } catch (e) { alert(e.message); }
  }

  async function doMerge() {
    if (!merge?.removeId || String(merge.removeId) === String(merge.keep.id)) return;
    const removed = rows.find(r => String(r.id) === String(merge.removeId));
    if (!confirm(L('pMergeTitle') + ' : « ' + (removed?.name || '') + ' » → « ' + merge.keep.name + ' » ?')) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('app_merge_parties', { p_type: type, p_keep: merge.keep.id, p_remove: Number(merge.removeId) });
      if (error) throw new Error(error.message);
      await auditLog(isClients ? 'Clients' : 'Fournisseurs', 'UPDATE', merge.keep.name, 'Fusion avec « ' + (data?.removed || '') + ' » : ' + (data?.documents || 0) + ' document(s)');
      alert(L('pMergeDone') + ' : ' + (data?.documents || 0) + ' document(s)');
      setMerge(null);
      load();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }

  function newParty() {
    if (!canWriteParty) return;
    setForm({
      name: '', type: 'entreprise', ice: '', phone: '', city: '', address: '', contact: '',
      assigned_to: session?.user?.id || '',
      branch_id: currentBranchId() || branches[0]?.id || '',
      branch_ids: [],
      pos_visible: true
    });
  }

  if (err) return <ErrorBox msg={err} />;

  const norm = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const nameCount = {};
  rows.forEach(r => { if (!r.is_walk_in) nameCount[norm(r.name)] = (nameCount[norm(r.name)] || 0) + 1; });
  const isDup = x => !x.is_walk_in && nameCount[norm(x.name)] > 1;

  const filteredRows = (ownerFilter === 'all' ? rows : rows.filter(x => String(x.assigned_to || '') === String(ownerFilter)))
    .filter(x => scopeFilter === 'all' || (scopeFilter === 'shared' ? !partyBranchIds(x).length && !x.is_walk_in : scopeFilter === 'walkin' ? x.is_walk_in : scopeFilter === 'dups' ? isDup(x)
      : scopeFilter === 'pos' ? (x.is_walk_in || x.pos_visible !== false) : scopeFilter === 'nopos' ? (!x.is_walk_in && x.pos_visible === false) : partyBranchIds(x).length && !x.is_walk_in))
    .filter(x => !search || [x.name, x.ice, x.phone, x.city, x.contact, x.assignedToLabel].join(' ').toLowerCase().includes(search.toLowerCase()));

  const uniqueOwners = users.filter(u => rows.some(x => String(x.assigned_to || '') === String(u.id)));
  const sharedCount = rows.filter(x => !x.is_walk_in && !partyBranchIds(x).length).length;
  const dupCount = rows.filter(isDup).length;
  const totalOutstanding = filteredRows.reduce((t, x) => t + Number(balances[x.id]?.outstanding || 0), 0);
  const formScopeOnly = form && (Array.isArray(form.branch_ids) ? form.branch_ids.length > 0 : partyBranchIds(form).length > 0);
  const formIds = form ? (Array.isArray(form.branch_ids) ? form.branch_ids.map(Number) : partyBranchIds(form)) : [];

  return (
    <>
      <Header title={isClients ? L('clients') : L('suppliers')}>
        <input className="input max-w-xs" placeholder={L('search')} value={search} onChange={e => setSearch(e.target.value)} />
        <ExportButtons L={L} spec={() => ({
          fileName: isClients ? 'Clients' : 'Fournisseurs', title: isClients ? L('clients') : L('suppliers'),
          sheets: [{ name: isClients ? L('clients') : L('suppliers'), totals: false,
            note: 'Fichier réimportable : ' + (isClients ? 'Clients' : 'Fournisseurs') + ' → Import Excel.',
            columns: isClients ? [
              { key: 'name', header: 'Nom' }, { key: 'type', header: 'Type (entreprise / particulier)' }, { key: 'phone', header: 'Téléphone' },
              { key: 'city', header: 'Ville' }, { key: 'address', header: 'Adresse' }, { key: 'ice', header: 'ICE' },
              { key: 'price_tier', header: 'Tarif (detail / gros)' }, { key: 'credit_limit', header: 'Plafond de crédit (DH, 0 = aucun)', type: 'money' },
              { value: x => (x.is_walk_in || x.pos_visible !== false) ? 'Oui' : 'Non', header: 'Caisse (comptoir)' },
              { value: x => Number(balances[x.id]?.outstanding || 0), header: L('outstanding'), type: 'money', total: true },
              { value: x => scopeLabel(x), header: L('pScope') }, { value: x => branchName(x.branch_id), header: L('pOrigin') },
              { key: 'createdByLabel', header: L('createdBy') }, { key: 'assignedToLabel', header: L('assignedTo') }
            ] : [
              { key: 'name', header: 'Nom' }, { key: 'contact', header: 'Contact' }, { key: 'phone', header: 'Téléphone' },
              { key: 'city', header: 'Ville' }, { key: 'address', header: 'Adresse' }, { key: 'ice', header: 'ICE' },
              { value: x => Number(balances[x.id]?.outstanding || 0), header: L('outstanding'), type: 'money', total: true },
              { value: x => scopeLabel(x), header: L('pScope') }, { value: x => branchName(x.branch_id), header: L('pOrigin') },
              { key: 'createdByLabel', header: L('createdBy') }
            ], rows: filteredRows }]
        })} />
        {isClients ? (
          <select className="input max-w-xs" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
            <option value="all">{L('all')} - {L('clientOwner')}</option>
            {uniqueOwners.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
          </select>
        ) : null}
        {canWriteParty && featureOn('import') ? <button onClick={() => setShowImport(true)} className="btn bg-white border">📥 {L('importExcel')}</button> : null}
        {admin ? <button onClick={() => setWalkIns(true)} className="btn bg-white border">🏪 {isClients ? L('wiTitleClients') : L('wiTitleSuppliers')}</button> : null}
        {canWriteParty ? <button onClick={newParty} className="btn bg-amber-500">{L('new')}</button> : null}
      </Header>

      <div className="pro-kpi-grid mb-4">
        <div className="pro-kpi-card"><span>{isClients ? L('clients') : L('suppliers')}</span><b>{filteredRows.length}</b><small>{L('all')}</small></div>
        <div className="pro-kpi-card"><span>{L('pScopeAll')}</span><b>{sharedCount}</b><small>{L('pScopeHint').split(':')[0]}</small></div>
        <div className="pro-kpi-card"><span>{L('outstanding')}</span><b>{dh(totalOutstanding)}</b><small>{L('pBalances')}</small></div>
        <div className="pro-kpi-card"><span>{L('pDuplicatesFound')}</span><b>{dupCount}</b><small>{admin ? L('pMerge') : L('name')}</small></div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {[['all', L('all')], ['shared', L('pScopeAll')], ['only', L('pScopeOnly')], admin && ['walkin', '🏪 ' + L('pWalkIn')],
          isClients && ['pos', L('posOnly')], isClients && ['nopos', L('posHidden') + ' (' + rows.filter(x => !x.is_walk_in && x.pos_visible === false).length + ')'],
          ['dups', L('pDuplicatesFound') + ' (' + dupCount + ')']].filter(Boolean).map(([k, t]) => (
          <button key={k} onClick={() => setScopeFilter(k)} className={'px-3 py-1.5 rounded-full text-xs font-semibold ' + (scopeFilter === k ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600')}>{t}</button>
        ))}
      </div>

      <Table>
        <thead>
          <tr>
            <th>{L('name')}</th>
            <th>{isClients ? 'ICE' : L('pContact') + ' / ICE'}</th>
            <th>{L('phone')}</th>
            <th>{L('city')}</th>
            {isClients ? <th>{L('assignedTo')}</th> : null}
            <th>{L('outstanding')}{isClients ? ' / ' + L('creditLimit') : ''}</th>
            <th>{L('pScope')}</th>
            <th>{L('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map(x => {
            const b = balances[x.id];
            const over = isClients && Number(x.credit_limit || 0) > 0 && Number(b?.outstanding || 0) > Number(x.credit_limit);
            return (
              <tr key={x.id} className={x.is_walk_in ? 'party-walkin' : ''}>
                <td>
                  <div className="font-semibold">{x.is_walk_in ? '🏪 ' : ''}{x.name}</div>
                  <div className="text-xs text-slate-400">{x.is_walk_in ? <Badge tone="amber">{L('pWalkIn')}</Badge> : (L('createdBy') + ' ' + (x.createdByLabel || '-'))}{isDup(x) ? <> <Badge tone="red">{L('pDuplicatesFound')}</Badge></> : null}{isClients && !x.is_walk_in && x.pos_visible === false ? <> <span className="badge-pos-off" title={L('posVisibleHint')}>🚫 {L('posHidden')}</span></> : null}</div>
                </td>
                <td className="text-xs text-slate-500">{isClients ? (x.ice || '-') : [x.contact, x.ice].filter(Boolean).join(' · ') || '-'}</td>
                <td>{x.phone || '-'}</td>
                <td>{x.city || '-'}</td>
                {isClients ? <td>{x.is_walk_in ? '-' : <Badge tone="blue">{x.assignedToLabel || '-'}</Badge>}</td> : null}
                <td title={(b?.byBranch || []).filter(v => v.outstanding > 0.009).map(v => branchName(v.branchId) + ' : ' + dh(v.outstanding)).join('\n')}>
                  <div className={over ? 'text-red-600 font-bold' : 'font-semibold'}>{dh(b?.outstanding || 0)}</div>
                  {(b?.byBranch || []).filter(v => v.outstanding > 0.009).length > 1 ? (
                    <div className="text-xs text-slate-500">{(b.byBranch || []).filter(v => v.outstanding > 0.009).map(v => branchName(v.branchId) + ' ' + fmt(v.outstanding)).join(' · ')}</div>
                  ) : null}
                  {isClients && !x.is_walk_in ? <div className="text-xs text-slate-400">{Number(x.credit_limit || 0) > 0 ? '/ ' + dh(x.credit_limit) : L('noLimit')}{x.price_tier === 'gros' ? ' · ' + L('wholesale') : ''}</div> : null}
                </td>
                <td>
                  {x.is_walk_in ? <Badge tone="slate">{branchName(x.branch_id)}</Badge>
                    : partyBranchIds(x).length ? <Badge tone="blue">{scopeLabel(x)}</Badge> : <Badge tone="green">{L('pScopeAll')}</Badge>}
                  <div className="text-xs text-slate-400 mt-1">{L('pOrigin')} : {branchName(x.branch_id)}</div>
                </td>
                <td className="flex gap-1 flex-wrap">
                  {canWriteParty && (!x.is_walk_in || admin) ? <button onClick={() => setForm({ ...x, branch_ids: partyBranchIds(x) })} className="btn bg-white border">{L('edit')}</button> : null}
                  {x.is_walk_in && !admin ? <span className="text-xs text-slate-400" title={L('wiAdminOnly')}>🔒</span> : null}
                  {admin && canDeleteParty && !x.is_walk_in ? <button onClick={() => setMerge({ keep: x, removeId: '' })} className="btn bg-white border" title={L('pMergeTitle')}>⇄ {L('pMerge')}</button> : null}
                  {canDeleteParty && !x.is_walk_in ? <button onClick={() => remove(x)} className="btn bg-red-600 text-white">{L('del')}</button> : null}
                </td>
              </tr>
            );
          })}
          {!filteredRows.length ? <tr><td colSpan="8" className="text-center text-slate-500 py-6">{L('noData')}</td></tr> : null}
        </tbody>
      </Table>

      {form ? (
        <Modal title={(form.id ? L('edit') : L('new')) + ' — ' + (isClients ? L('clients') : L('suppliers'))} onClose={() => { setForm(null); setDups(null); }}>
          {form.is_walk_in ? <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mb-3 text-sm">{isClients ? L('pWalkInHint') : L('pSupplierWalkInHint')}</div> : null}
          <div className="grid grid-cols-2 gap-x-3">
            <label className="text-xs text-slate-500 col-span-2">{L('name')}
              <input className="input mt-1 mb-2" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            </label>
            {!isClients ? (
              <label className="text-xs text-slate-500 col-span-2">{L('pContact')}
                <input className="input mt-1 mb-2" value={form.contact || ''} onChange={e => setForm({ ...form, contact: e.target.value })} />
              </label>
            ) : null}
            <label className="text-xs text-slate-500">{L('phone')}
              <input className="input mt-1 mb-2" inputMode="tel" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label className="text-xs text-slate-500">ICE
              <input className="input mt-1 mb-2" value={form.ice || ''} onChange={e => setForm({ ...form, ice: e.target.value })} />
            </label>
            <label className="text-xs text-slate-500">{L('city')}
              <input className="input mt-1 mb-2" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="text-xs text-slate-500">{L('address') || 'Adresse'}
              <input className="input mt-1 mb-2" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
            </label>
          </div>

          {isClients && !form.is_walk_in ? (
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

          {isClients && !form.is_walk_in ? (
            <div className={'pos-visible-box ' + (form.pos_visible !== false ? 'on' : 'off')}>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" data-pos-visible disabled={!admin} checked={form.pos_visible !== false} onChange={e => setForm({ ...form, pos_visible: e.target.checked })} />
                {L('posVisible')}
                {!admin ? <span className="text-xs text-slate-400" title={L('posAdminOnly')}>🔒</span> : null}
              </label>
              <div className="text-xs text-slate-500 mt-1">{admin ? L('posVisibleHint') : L('posAdminOnly')}</div>
            </div>
          ) : null}

          {isClients && !form.is_walk_in ? (
            <label className="text-xs text-slate-500 block">{L('assignedTo')}
              <select className="input mt-1 mb-2" value={form.assigned_to || ''} disabled={!canAssignParty} onChange={e => setForm({ ...form, assigned_to: e.target.value ? Number(e.target.value) : null })}>
                <option value="">--</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
              </select>
            </label>
          ) : null}

          {!form.is_walk_in && branches.length > 1 ? (
            <div className="border rounded-xl p-3 mb-3 space-y-2">
              <div className="text-xs text-slate-500 font-semibold">{L('pScope')}</div>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="pscope" checked={!formScopeOnly} onChange={() => setForm({ ...form, branch_ids: [] })} /> {L('pScopeAll')}</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="pscope" checked={!!formScopeOnly} onChange={() => setForm({ ...form, branch_ids: [Number(form.branch_id || currentBranchId() || branches[0]?.id)] })} /> {L('pScopeOnly')}</label>
              {formScopeOnly ? (
                <div className="flex flex-wrap gap-3 ps-6">
                  {branches.map(b => {
                    const mine = !admin && Number(b.id) === Number(currentBranchId());
                    return (
                      <label key={b.id} className="flex items-center gap-1 text-sm">
                        <input type="checkbox" disabled={mine} checked={formIds.includes(Number(b.id))}
                          onChange={e => setForm({ ...form, branch_ids: e.target.checked ? [...formIds, Number(b.id)] : formIds.filter(v => v !== Number(b.id)) })} />
                        {b.name}
                      </label>
                    );
                  })}
                </div>
              ) : null}
              <p className="text-xs text-slate-400">{L('pScopeHint')}</p>
              {admin ? (
                <label className="text-xs text-slate-500 block">{L('pOrigin')}
                  <select className="input mt-1" value={form.branch_id || ''} onChange={e => setForm({ ...form, branch_id: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">--</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </label>
              ) : null}
            </div>
          ) : null}

          {dups ? (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-3 text-sm space-y-2">
              <div className="font-bold text-amber-900">⚠ {L('pDupTitle')}</div>
              <div className="text-amber-800 text-xs">{L('pDupHint')}</div>
              {dups.map(d => (
                <div key={d.id} className="bg-white rounded-lg border p-2 flex flex-wrap items-center gap-2 justify-between">
                  <div>
                    <b>{d.name}</b> <span className="text-xs text-slate-500">{[d.phone, d.ice, d.city].filter(Boolean).join(' · ')}</span>
                    <div className="text-xs text-slate-500">{L('pOrigin')} : {d.branch_name || '-'} · {d.shared ? L('pScopeAll') : L('pScopeOnly')} · <b>{L('pDupReason_' + d.reason)}</b></div>
                  </div>
                  <button disabled={busy} onClick={() => useExisting(d, !d.visible)} className="btn bg-slate-900 text-white text-xs">{d.visible ? L('pDupUse') : L('pDupShare')}</button>
                </div>
              ))}
              <button disabled={busy} onClick={() => save(true)} className="btn bg-white border text-xs">{L('pDupCreate')}</button>
            </div>
          ) : null}

          {form.id ? <AttachmentsPanel L={L} entityType={isClients ? 'client' : 'supplier'} entityId={form.id} branchId={form.branch_id} /> : null}

          <button disabled={busy} onClick={() => save(false)} className="btn bg-amber-500 mt-2">{busy ? '…' : L('save')}</button>
        </Modal>
      ) : null}

      {merge ? (
        <Modal title={L('pMergeTitle')} onClose={() => setMerge(null)}>
          <p className="text-sm text-slate-600 mb-3">{L('pMergeHint')}</p>
          <div className="text-xs text-slate-500">{L('pMergeKeep')}</div>
          <div className="font-bold mb-3">{merge.keep.is_walk_in ? '🏪 ' : ''}{merge.keep.name} <span className="text-xs text-slate-500">{merge.keep.phone || ''} · {branchName(merge.keep.branch_id)}</span></div>
          <label className="text-xs text-slate-500 block">{L('pMergeRemove')}
            <select className="input mt-1 mb-3" value={merge.removeId} onChange={e => setMerge({ ...merge, removeId: e.target.value })}>
              <option value="">--</option>
              {rows.filter(r => r.id !== merge.keep.id && !r.is_walk_in)
                .sort((a, b) => Number(norm(b.name) === norm(merge.keep.name)) - Number(norm(a.name) === norm(merge.keep.name)))
                .map(r => <option key={r.id} value={r.id}>{r.name} — {r.phone || '-'} · {branchName(r.branch_id)} · {dh(balances[r.id]?.outstanding || 0)}</option>)}
            </select>
          </label>
          <button disabled={busy || !merge.removeId} onClick={doMerge} className="btn bg-red-600 text-white">⇄ {L('pMerge')}</button>
        </Modal>
      ) : null}
      {showImport ? <ImportModal L={L} kind={type} branches={branches} close={() => setShowImport(false)} done={load} /> : null}
      {walkIns ? <WalkInManager L={L} type={type} close={() => { setWalkIns(false); load(); }} /> : null}
    </>
  );
}

/* ---------- V54 : gestion des fiches comptoir (administrateur) ---------- */
function WalkInManager({ L, type, close }) {
  const isClients = type === 'clients';
  const [rows, setRows] = useState([]);
  const [edits, setEdits] = useState({});
  const [stats, setStats] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [adding, setAdding] = useState(null);
  async function load() {
    try {
      const [{ data: parties, error }, st, bs] = await Promise.all([
        supabase.from(type).select('*').eq('is_walk_in', true).order('branch_id').order('id'),
        supabase.rpc('app_walk_in_stats'),
        loadBranches()
      ]);
      if (error) throw new Error(error.message);
      const stRows = (st.data || []).filter(r => r.kind === type);
      setStats(stRows);
      setBranchList(bs);
      // V56 : plusieurs fiches par droguerie ; la première créée reste celle par défaut
      const out = [];
      bs.forEach(b => {
        const list = (parties || []).filter(p => Number(p.branch_id) === Number(b.id)).sort((x, y) => Number(x.id) - Number(y.id));
        if (!list.length) out.push({ branch: b, party: null, st: null, isDefault: false });
        list.forEach((p, i) => out.push({ branch: b, party: p, st: stRows.find(r => Number(r.party_id) === Number(p.id)) || null, isDefault: i === 0, first: i === 0 }));
      });
      setRows(out);
      setEdits({});
    } catch (e) { setMsg(e.message); }
  }
  async function addOne() {
    if (!adding?.name || !String(adding.name).trim()) return setMsg(L('name') + ' ?');
    setBusy(true); setMsg('');
    const { error } = await supabase.rpc('app_admin_add_walk_in', { p_type: type, p_branch: Number(adding.branch_id), p_name: String(adding.name).trim(), p_phone: adding.phone || '', p_price_tier: adding.price_tier === 'gros' ? 'gros' : 'detail' });
    if (error) setMsg(error.message);
    else {
      await auditLog(isClients ? 'Clients' : 'Fournisseurs', 'CREATE', adding.name, isClients ? 'Nouvelle fiche comptoir' : 'Nouveau fournisseur divers');
      setMsg(L('wiSaved') + ' : ' + adding.name); setAdding(null);
    }
    await load();
    setBusy(false);
  }
  async function removeOne(p) {
    if (!confirm(L('del') + ' « ' + p.name + ' » ?')) return;
    setBusy(true); setMsg('');
    try { await deleteParty(type, p.id); setMsg(L('wiDeleted') + ' : ' + p.name); } catch (e) { setMsg(e.message); }
    await load();
    setBusy(false);
  }
  useEffect(() => { load(); }, []);
  const val = (p, k) => (edits[p.id] && edits[p.id][k] !== undefined ? edits[p.id][k] : (p[k] ?? ''));
  const setVal = (p, k, v) => setEdits({ ...edits, [p.id]: { ...(edits[p.id] || {}), [k]: v } });
  async function saveRow(p) {
    setBusy(true); setMsg('');
    try {
      const e = edits[p.id] || {};
      await saveParty(type, { ...p, ...e, is_walk_in: true });
      setMsg(L('wiSaved') + ' : ' + (e.name || p.name));
      await load();
    } catch (er) { setMsg(er.message); }
    setBusy(false);
  }
  async function createMissing() {
    setBusy(true); setMsg('');
    const { data, error } = await supabase.rpc('app_admin_ensure_walk_ins');
    setMsg(error ? error.message : (L('wiCreateMissing') + ' : ' + (data || 0)));
    await load();
    setBusy(false);
  }
  const missing = rows.filter(r => !r.party).length;
  const sum = k => stats.reduce((t, r) => t + Number(r[k] || 0), 0);
  return (
    <Modal title={'🏪 ' + (isClients ? L('wiTitleClients') : L('wiTitleSuppliers'))} onClose={close} wide>
      <p className="text-sm text-slate-500 mb-1">{isClients ? L('wiHint') : L('wiHintSuppliers')}</p>
      <p className="text-xs text-slate-400 mb-3">🔒 {L('wiPrivate')}</p>
      <div className="pro-kpi-grid mb-3">
        <div className="pro-kpi-card"><span>{L('wiToday')}</span><b>{dh(sum('today_total'))}</b><small>{isClients ? L('sales') : L('purchases')}</small></div>
        <div className="pro-kpi-card"><span>{L('wiMonth')}</span><b>{dh(sum('month_total'))}</b><small>{isClients ? L('sales') : L('purchases')}</small></div>
        <div className="pro-kpi-card"><span>{L('wiTotal')}</span><b>{dh(sum('total'))}</b><small>{sum('docs')} {L('wiDocs').toLowerCase()}</small></div>
      </div>
      <div className="card overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>{L('pBranch')}</th><th>{L('name')}</th>{isClients ? <th>{L('priceTier')}</th> : null}<th>{L('phone')}</th>
              <th>{L('wiDocs')}</th><th>{L('wiMonth')}</th><th>{L('wiTotal')}</th><th>{L('wiLast')}</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ branch, party, st, isDefault, first }) => (
              <tr key={branch.id + '-' + (party?.id || 'x')}>
                <td className={'whitespace-nowrap ' + (first || !party ? 'font-semibold' : 'text-xs text-slate-400')}>{branch.name}</td>
                {party ? (
                  <>
                    <td>
                      <input className="input" style={{ minWidth: 190 }} title={L('wiNameHint')} value={val(party, 'name')} onChange={e => setVal(party, 'name', e.target.value)} />
                      {isDefault ? <div className="mt-1"><span title={L('wiDefaultHint')}><Badge tone="amber">{L('wiDefault')}</Badge></span></div> : null}
                    </td>
                    {isClients ? (
                      <td>
                        <select className="input" style={{ minWidth: 100 }} value={val(party, 'price_tier') || 'detail'} onChange={e => setVal(party, 'price_tier', e.target.value)}>
                          <option value="detail">{L('retail')}</option>
                          <option value="gros">{L('wholesale')}</option>
                        </select>
                      </td>
                    ) : null}
                    <td><input className="input" style={{ minWidth: 110 }} inputMode="tel" value={val(party, 'phone')} onChange={e => setVal(party, 'phone', e.target.value)} /></td>
                    <td>{st?.docs || 0}</td>
                    <td className="whitespace-nowrap">{dh(st?.month_total || 0)}</td>
                    <td className="whitespace-nowrap font-semibold">{dh(st?.total || 0)}</td>
                    <td className="whitespace-nowrap">{st?.last_date ? frDate(st.last_date) : '-'}</td>
                    <td className="whitespace-nowrap">
                      <button disabled={busy || !edits[party.id]} onClick={() => saveRow(party)} className="btn bg-amber-500 text-sm">{L('save')}</button>
                      {!isDefault && !Number(st?.docs || 0) ? <button disabled={busy} onClick={() => removeOne(party)} className="btn bg-white border text-red-600 text-sm ms-1" title={L('del')}>🗑</button> : null}
                    </td>
                  </>
                ) : (
                  <td colSpan={isClients ? 8 : 7}><Badge tone="red">{L('wiMissing')}</Badge></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adding ? (
        <div className="wi-add card p-3 mt-3" data-wi-add>
          <div className="font-semibold mb-2">＋ {isClients ? L('wiAddTitle') : L('wiAddSupplierTitle')}</div>
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-xs text-slate-500">{L('pBranch')}
              <select className="input mt-1" value={adding.branch_id} onChange={e => setAdding({ ...adding, branch_id: e.target.value })}>
                {branchList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
            <label className="text-xs text-slate-500 flex-1" style={{ minWidth: 200 }}>{L('name')}
              <input className="input mt-1" autoFocus value={adding.name} onChange={e => setAdding({ ...adding, name: e.target.value })} placeholder={isClients ? 'Ex. : Client comptoir — Artisans' : 'Ex. : Fournisseur divers — Quincaillerie'} />
            </label>
            {isClients ? (
              <label className="text-xs text-slate-500">{L('priceTier')}
                <select className="input mt-1" value={adding.price_tier} onChange={e => setAdding({ ...adding, price_tier: e.target.value })}>
                  <option value="detail">{L('retail')}</option>
                  <option value="gros">{L('wholesale')}</option>
                </select>
              </label>
            ) : null}
            <label className="text-xs text-slate-500">{L('phone')}
              <input className="input mt-1" inputMode="tel" value={adding.phone} onChange={e => setAdding({ ...adding, phone: e.target.value })} />
            </label>
            <button disabled={busy} onClick={addOne} className="btn bg-amber-500">{L('save')}</button>
            <button disabled={busy} onClick={() => setAdding(null)} className="btn bg-white border">{L('closeBtn')}</button>
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
        <span className="text-sm text-slate-600">{msg}</span>
        <div className="flex gap-2">
          <ExportButtons L={L} spec={() => ({
            fileName: isClients ? 'Clients_comptoir' : 'Fournisseurs_divers', title: isClients ? L('wiTitleClients') : L('wiTitleSuppliers'),
            sheets: [{ name: isClients ? L('wiTitleClients') : L('wiTitleSuppliers'), columns: [
              { value: r => r.branch.name, header: L('pBranch') }, { value: r => r.party?.name || L('wiMissing'), header: L('name') },
              { value: r => r.st?.docs || 0, header: L('wiDocs'), type: 'int', total: true },
              { value: r => r.st?.today_total || 0, header: L('wiToday'), type: 'money' }, { value: r => r.st?.month_total || 0, header: L('wiMonth'), type: 'money' },
              { value: r => r.st?.total || 0, header: L('wiTotal'), type: 'money' }, { value: r => r.st?.last_date || '', header: L('wiLast'), type: 'date' }
            ], rows }]
          })} />
          {missing ? <button disabled={busy} onClick={createMissing} className="btn bg-slate-900 text-white">＋ {L('wiCreateMissing')} ({missing})</button> : null}
          {!adding ? <button disabled={busy} onClick={() => setAdding({ branch_id: String(currentBranchId() || branchList[0]?.id || ''), name: '', phone: '', price_tier: 'detail' })} className="btn bg-amber-500" data-wi-add-btn>＋ {L('wiAdd')}</button> : null}
          <button onClick={close} className="btn bg-white border">{L('closeBtn')}</button>
        </div>
      </div>
    </Modal>
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
  const [search, setSearch] = useState('');
  const [[from, to], setRange] = useState(['', '']);

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

  const filtered = (tab === 'in'
    ? rows.filter(x => x.quantity > 0)
    : tab === 'out'
      ? rows.filter(x => x.quantity < 0)
      : rows)
    .filter(x => inPeriod(x.date, from, to) && matchSearch(search, [x.ref, x.productName, x.branchName, x.docType, x.docNumber, x.userLabel, x.reason]));
  const [shown, more] = useShowMore(filtered, 100);

  const totalIn = rows.filter(x => x.quantity > 0).reduce((s, x) => s + x.quantity, 0);
  const totalOut = rows.filter(x => x.quantity < 0).reduce((s, x) => s + Math.abs(x.quantity), 0);

  return (
    <>
      <Header title={L('stockMoves')}>
        <button onClick={load} className="btn bg-white border">↻</button>
        <ExportButtons L={L} spec={() => ({
          fileName: 'Mouvements_stock', title: L('stockMoves'),
          sheets: [{ name: L('stockMoves'), columns: [
            { key: 'date', header: L('date'), type: 'datetime' }, { key: 'ref', header: L('ref') }, { key: 'productName', header: L('product') },
            { key: 'branchName', header: L('location') }, { key: 'quantity', header: L('quantity'), type: 'qty', total: true },
            { key: 'docType', header: L('docType') }, { key: 'docNumber', header: 'N° Doc' }, { key: 'userLabel', header: L('actor') }, { key: 'reason', header: L('reason') }
          ], rows: filtered }]
        })} />
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

      <ListToolbar L={L} search={search} setSearch={setSearch} from={from} to={to} setPeriod={(f, t) => setRange([f, t])} count={filtered.length} total={rows.length} onReset={() => { setSearch(''); setRange(['', '']); }} />

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
          {shown.map(m => (
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
          {!filtered.length ? <tr><td colSpan="9" className="text-center text-slate-500 py-6">{L('noData')}</td></tr> : null}
        </tbody>
      </Table>
      <ShowMore L={L} more={more} shown={shown.length} total={filtered.length} />
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
        <ExportButtons L={L} spec={() => ({
          fileName: 'Journal_activite', title: L('audit'),
          sheets: [{ name: L('audit'), totals: false, columns: [
            { key: 'created_at', header: L('date'), type: 'datetime' }, { key: 'user_label', header: L('actor') }, { key: 'module', header: L('module') },
            { value: x => docActionLabel(x.action), header: L('actions') }, { key: 'object_label', header: L('object') }, { key: 'detail', header: L('detail') }
          ], rows: filtered }]
        })} />
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
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await saveSettings(settings);
      auditLog('Paramètres', 'UPDATE', 'Paramètres', 'Société / charte graphique / messages').catch?.(() => {});
      alert('Paramètres enregistrés');
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  }

  if (err) return <ErrorBox msg={err} />;
  if (!settings) return <p>Chargement...</p>;
  const set = (k, v) => setSettings(prev => ({ ...prev, [k]: v }));
  const field = (k, label, props = {}) => (
    <label className="text-xs text-slate-500 block">{label}
      <input className="input mt-1 mb-2" value={settings[k] || ''} onChange={e => set(k, e.target.value)} {...props} />
    </label>
  );

  return (
    <>
      <Header title={L('settings') || 'Paramètres'}>
        <button disabled={saving} onClick={save} className="btn bg-amber-500">{saving ? '…' : (L('save') || 'Enregistrer')}</button>
      </Header>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-bold mb-3">{L('company') || 'Société'}</h2>
          {field('company_name', L('company') || 'Société')}
          <div className="grid grid-cols-2 gap-x-3">
            {field('company_phone', L('phone') || 'Téléphone', { inputMode: 'tel' })}
            {field('company_email', L('companyEmail'), { type: 'email' })}
          </div>
          {field('company_website', L('companyWebsite'))}
          <label className="text-xs text-slate-500 block">{L('address') || 'Adresse'}
            <textarea className="input mt-1" rows={2} value={settings.company_address || ''} onChange={e => set('company_address', e.target.value)} />
          </label>
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-3">{L('companyLegal')}</h2>
          <div className="grid grid-cols-2 gap-x-3">
            {field('company_ice', L('ice') || 'ICE')}
            {field('company_rc', L('companyRc'))}
            {field('company_if', L('companyIf'))}
            {field('company_patente', L('companyPatente'))}
            {field('company_cnss', L('companyCnss'))}
            <label className="text-xs text-slate-500 block">{L('vat') || 'TVA'} %
              <input className="input mt-1 mb-2" type="number" value={settings.vat_rate || '20'} onChange={e => set('vat_rate', e.target.value)} />
            </label>
          </div>
          {field('company_rib', L('companyRib'))}
        </div>

        <BrandingSettings L={L} settings={settings} set={set} />

        <WaTemplatesSettings L={L} settings={settings} set={set} />

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
                  <input type="checkbox" checked={String(settings[flag] ?? '1') !== '0'} onChange={e => set(flag, e.target.checked ? '1' : '0')} />
                  {label}
                </label>
                {valueKey ? (
                  <label className="text-xs text-slate-500 block mt-2">{valueLabel}
                    <input className="input mt-1" type="number" min="0" disabled={String(settings[flag] ?? '1') === '0'} value={settings[valueKey] ?? ''} onChange={e => set(valueKey, e.target.value)} />
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

/* ---------- V52 : réglages de la charte graphique ---------- */
function BrandingSettings({ L, settings, set }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const b = brandFromSettings(settings);
  const preview = { ...b, name: settings.company_name || 'DrogueriePro', phone: settings.company_phone, address: settings.company_address, email: settings.company_email, ice: settings.company_ice };
  async function pick(file) {
    if (!file) return;
    setBusy(true);
    try {
      const r = await processLogoFile(file);
      set('brand_logo', r.dataUrl);
      // Premier logo avec les couleurs par défaut : on propose directement les couleurs du logo
      if (normHex(settings.brand_primary, BRAND_DEFAULTS.primary) === BRAND_DEFAULTS.primary && normHex(settings.brand_accent, BRAND_DEFAULTS.accent) === BRAND_DEFAULTS.accent) {
        const c = await extractLogoColors(r.dataUrl).catch(() => null);
        if (c) { set('brand_primary', c.primary); set('brand_accent', c.accent); }
      }
    } catch (e) { alert(e.message); }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  }
  async function fromLogo() {
    if (!b.logo) return;
    const c = await extractLogoColors(b.logo).catch(e => { alert(e.message); return null; });
    if (c) { set('brand_primary', c.primary); set('brand_accent', c.accent); }
  }
  const colorField = (k, label, fallback) => (
    <label className="text-xs text-slate-500 block">{label}
      <div className="flex items-center gap-2 mt-1">
        <input type="color" className="brand-color" value={normHex(settings[k], fallback)} onChange={e => set(k, e.target.value)} />
        <input className="input font-mono" style={{ maxWidth: 120 }} value={settings[k] || fallback} onChange={e => set(k, e.target.value)} onBlur={e => set(k, normHex(e.target.value, fallback))} />
      </div>
    </label>
  );
  return (
    <div className="card p-5 md:col-span-2 brand-settings">
      <h2 className="font-bold mb-1">🎨 {L('brandTitle')}</h2>
      <p className="text-xs text-slate-500 mb-4">{L('brandHint')}</p>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">{L('brandLogo')}</div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="brand-logo-box">{b.logo ? <img src={b.logo} alt="logo" /> : <span className="text-slate-400 text-xs">—</span>}</div>
              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif" className="hidden" onChange={e => pick(e.target.files?.[0])} />
                <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="btn bg-slate-900 text-white">{busy ? '…' : '🖼 ' + L('brandLogoChoose')}</button>
                {b.logo ? <button type="button" onClick={() => set('brand_logo', '')} className="btn bg-white border text-red-600">{L('brandLogoRemove')}</button> : null}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{L('brandLogoHint')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {colorField('brand_primary', L('brandPrimary'), BRAND_DEFAULTS.primary)}
            {colorField('brand_accent', L('brandAccent'), BRAND_DEFAULTS.accent)}
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">{L('brandPresets')}</div>
            <div className="flex flex-wrap gap-2 items-center">
              {BRAND_PRESETS.map(([p1, a1]) => (
                <button type="button" key={p1 + a1} title={p1 + ' / ' + a1} className="brand-swatch" onClick={() => { set('brand_primary', p1); set('brand_accent', a1); }}>
                  <span style={{ background: p1 }} /><span style={{ background: a1 }} />
                </button>
              ))}
              {b.logo ? <button type="button" onClick={fromLogo} className="btn bg-white border text-sm">🎯 {L('brandFromLogo')}</button> : null}
              <button type="button" onClick={() => { set('brand_primary', BRAND_DEFAULTS.primary); set('brand_accent', BRAND_DEFAULTS.accent); }} className="btn bg-white border text-sm">{L('brandReset')}</button>
            </div>
          </div>
          <label className="text-xs text-slate-500 block">{L('brandSlogan')}
            <input className="input mt-1" value={settings.brand_slogan || ''} onChange={e => set('brand_slogan', e.target.value)} placeholder="Ex. : Tout pour la peinture et le bâtiment" />
          </label>
          <label className="text-xs text-slate-500 block">{L('brandDocFooter')}
            <textarea className="input mt-1" rows={2} value={settings.brand_doc_footer || ''} onChange={e => set('brand_doc_footer', e.target.value)} placeholder={L('brandDocFooterHint')} />
          </label>
          <label className="text-xs text-slate-500 block">{L('brandTicketMessage')}
            <input className="input mt-1" value={settings.brand_ticket_message || ''} onChange={e => set('brand_ticket_message', e.target.value)} placeholder="Merci de votre visite" />
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={String(settings.brand_ticket_logo ?? '1') !== '0'} onChange={e => set('brand_ticket_logo', e.target.checked ? '1' : '0')} /> {L('brandTicketLogo')}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={String(settings.brand_apply_app ?? '1') !== '0'} onChange={e => set('brand_apply_app', e.target.checked ? '1' : '0')} /> {L('brandApplyApp')}</label>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">{L('brandPreview')}</div>
          <div className="brand-preview">
            <div className="simple-document" style={docStyle(preview)}>
              <DocBrandHeader L={L} company={preview} title={L('customerInvoice')} number="FAC-2026-0001" date={frDate(today())} />
              <table className="simple-lines">
                <thead><tr><th>{L('product')}</th><th>{L('quantity')}</th><th>{L('totalTTC')}</th></tr></thead>
                <tbody>
                  <tr><td>Peinture blanche 5L</td><td>2</td><td>360,00 DH</td></tr>
                  <tr><td>Rouleau 180 mm</td><td>3</td><td>135,00 DH</td></tr>
                </tbody>
              </table>
              <div className="simple-totals mt-2" style={{ maxWidth: 240, marginInlineStart: 'auto' }}>
                <div className="simple-grand"><span>{L('netToPay')}</span><b>495,00 DH</b></div>
              </div>
              <DocFooterText company={{ docFooter: settings.brand_doc_footer, rib: settings.company_rib }} />
            </div>
            <div className="brand-app-preview" style={brandVars(b)}>
              <div className="bap-side">
                {b.logo ? <img src={b.logo} alt="" /> : null}
                <b>{settings.company_name || 'DrogueriePro'}</b>
                <span className="bap-item on">{L('dashboard')}</span>
                <span className="bap-item">{L('sales')}</span>
              </div>
              <div className="bap-main">
                <span className="bap-btn">{L('new')}</span>
                <span className="bap-xl">📊 Excel</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">{L('brandSaveHint')}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- V52 : modèles de messages WhatsApp ---------- */
function WaTemplatesSettings({ L, settings, set }) {
  const [kind, setKind] = useState('doc');
  return (
    <div className="card p-5 md:col-span-2">
      <h2 className="font-bold mb-1">🟢 {L('waTemplates')}</h2>
      <p className="text-xs text-slate-500 mb-3">{L('waTemplatesHint')}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {WA_KINDS.map(k => (
          <button type="button" key={k} onClick={() => setKind(k)} className={'btn text-sm ' + (kind === k ? 'bg-slate-900 text-white' : 'bg-white border')}>{L('waKind_' + k)}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {['fr', 'ar'].map(lang => {
          const key = 'wa_tpl_' + kind + '_' + lang;
          return (
            <div key={lang}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500 font-semibold">{lang === 'fr' ? 'Français' : 'العربية'}</span>
                <button type="button" onClick={() => set(key, '')} className="text-xs text-sky-700 underline">{L('waRestore')}</button>
              </div>
              <textarea className="input font-sans" rows={9} dir={lang === 'ar' ? 'rtl' : 'ltr'}
                value={String(settings[key] || '').trim() ? settings[key] : WA_DEFAULTS[lang][kind]}
                onChange={e => set(key, e.target.value === WA_DEFAULTS[lang][kind] ? '' : e.target.value)} />
            </div>
          );
        })}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-3">
        <label className="text-xs text-slate-500 block">{L('waDefaultLang')}
          <select className="input mt-1" value={settings.wa_default_lang || ''} onChange={e => set('wa_default_lang', e.target.value)}>
            <option value="">{L('lang') === 'Français' ? 'لغة التطبيق' : 'Langue de l\'application'}</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </label>
        <label className="text-xs text-slate-500 block">{L('waLinkDefaultDays')}
          <input className="input mt-1" type="number" min="1" max="365" value={settings.wa_link_days || '30'} onChange={e => set('wa_link_days', e.target.value)} />
        </label>
      </div>
    </div>
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
