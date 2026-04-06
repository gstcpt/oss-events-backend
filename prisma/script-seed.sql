CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------
-- SEED: larger random-like dataset
-- -------------------------

BEGIN;

    -- app_settings
        INSERT INTO app_settings (id, famille, title, value) VALUES (1, 'STATUS_NOTIFICATION', 'Non lu', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (2, 'STATUS_NOTIFICATION', 'Lu', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (3, 'STATUS_MESSAGES_SENDER', 'Brouillon', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (4, 'STATUS_MESSAGES_SENDER', 'Envoyer', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (5, 'STATUS_MESSAGES_SENDER', 'Brouillon dans Corbeille', 2); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (6, 'STATUS_MESSAGES_SENDER', 'Envoyer dans Corbeille', 3); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (7, 'STATUS_MESSAGES_RECEIVER', 'Reçu non lu', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (8, 'STATUS_MESSAGES_RECEIVER', 'Reçu lu', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (9, 'STATUS_MESSAGES_RECEIVER', 'Reçu non lu dans Corbeille', 2); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (10, 'STATUS_MESSAGES_RECEIVER', 'Reçu lu dans Corbeille', 3); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (11, 'STATUS_USERS', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (12, 'STATUS_USERS', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (13, 'STATUS_USERS', 'Bloqué', 2); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (14, 'STATUS_EVENTS', 'Nouveau', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (15, 'STATUS_EVENTS', 'En cours', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (16, 'STATUS_EVENTS', 'Valider', 2); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (17, 'STATUS_EVENTS', 'Cloture', 3); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (18, 'STATUS_EVENTS', 'Annuler', 4); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (19, 'STATUS_COMPANIES', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (20, 'STATUS_COMPANIES', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (21, 'STATUS_COMPANY_SETTINGS', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (22, 'STATUS_COMPANY_SETTINGS', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (23, 'STATUS_ROLES', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (24, 'STATUS_ROLES', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (25, 'STATUS_TAGS', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (26, 'STATUS_TAGS', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (27, 'STATUS_SUBSCRIPTION', 'Nouveau', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (28, 'STATUS_SUBSCRIPTION', 'En cours', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (29, 'STATUS_SUBSCRIPTION', 'Cloture', 2); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (30, 'STATUS_SUBSCRIPTION', 'Bloquer', 3); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (31, 'STATUS_SUBSCRIPTION', 'Annuler', 4); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (32, 'STATUS_ITEMS', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (33, 'STATUS_ITEMS', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (34, 'STATUS_CATEGORIES', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (35, 'STATUS_CATEGORIES', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (36, 'STATUS_PACKS', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (37, 'STATUS_PACKS', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (38, 'STATUS_PERMISSIONS', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (39, 'STATUS_PERMISSIONS', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (40, 'STATUS_ITEM_MEDIA', 'Désactive', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (41, 'STATUS_ITEM_MEDIA', 'Active', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (42, 'SOURCE_MESSAGE', 'Internal', 0); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (43, 'SOURCE_MESSAGE', 'Contact', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (44, 'TVA', '7%', 7); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (45, 'TVA', '13%', 13); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (46, 'TVA', '19%', 19); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (47, 'TYPE_INTERACTIONS', 'Like', 'True or nothing'); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (48, 'TYPE_INTERACTIONS', 'Dislike', 'True or nothing'); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (49, 'TYPE_INTERACTIONS', 'Favori', 'True or nothing'); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (50, 'TYPE_INTERACTIONS', 'Commentaire', 'Commentaire or nothing'); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (51, 'TYPE_INTERACTIONS', 'Share', 'Nbr share'); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (52, 'TYPE_INTERACTIONS', 'Rating', 'nbr 1 to 5 or nothing'); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (53, 'TYPE_INTERACTIONS', 'View', 'nbr 1 to n or nothing'); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (54, 'TYPE_ITEM_MEDIA', 'Photo profile', 1); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (55, 'TYPE_ITEM_MEDIA', 'Photo coverture', 2); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (56, 'TYPE_ITEM_MEDIA', 'Photo galerie', 3); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (57, 'TYPE_ITEM_MEDIA', 'Video', 4); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (58, 'TYPE_ITEM_MEDIA', 'PDF', 5); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (59, 'TYPE_ITEM_MEDIA', 'Word', 6); 
        INSERT INTO app_settings (id, famille, title, value) VALUES (60, 'TYPE_ITEM_MEDIA', 'Excel', 7);
        INSERT INTO app_settings (id, famille, title, value) VALUES (61, 'DEVISE', 'TND', 0);
        INSERT INTO app_settings (id, famille, title, value) VALUES (62, 'DEVISE', 'USD', 1);
        INSERT INTO app_settings (id, famille, title, value) VALUES (63, 'DEVISE', 'EUR', 2);
        INSERT INTO app_settings (id, famille, title, value) VALUES (64, 'PAYMENT_METHOD', 'Espèces', 0);
        INSERT INTO app_settings (id, famille, title, value) VALUES (65, 'PAYMENT_METHOD', 'Virement', 1);
        INSERT INTO app_settings (id, famille, title, value) VALUES (66, 'PAYMENT_METHOD', 'Chèque', 2);

    -- modules & permissions
        INSERT INTO modules (id, title) VALUES (1, 'Inventory');
        INSERT INTO modules (id, title) VALUES (2, 'Bookings');
        INSERT INTO modules (id, title) VALUES (3, 'Users');
        INSERT INTO modules (id, title) VALUES (4, 'Payments');
        INSERT INTO modules (id, title) VALUES (5, 'Analytics');
        INSERT INTO modules (id, title) VALUES (6, 'Content');

    -- permissions
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (1, 'View Items', 'VIEW_ITEMS', 1, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (2, 'Create Booking', 'CREATE_BOOKING', 2, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (3, 'Manage Users', 'MANAGE_USERS', 3, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (4, 'View Payments', 'VIEW_PAYMENTS', 4, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (5, 'View Analytics', 'VIEW_ANALYTICS', 5, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (6, 'Manage Content', 'MANAGE_CONTENT', 6, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (7, 'Edit Items', 'EDIT_ITEMS', 1, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (8, 'Delete Items', 'DELETE_ITEMS', 1, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (9, 'Export Data', 'EXPORT_DATA', 5, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (10, 'Apply Discount', 'APPLY_DISCOUNT', 2, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (11, 'Create Pack', 'CREATE_PACK', 6, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (12, 'Subscribe Company', 'SUBSCRIBE_COMPANY', 6, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (13, 'View Messages', 'VIEW_MESSAGES', 3, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (14, 'Respond Messages', 'RESPOND_MESSAGES', 3, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (15, 'Manage Tags', 'MANAGE_TAGS', 6, 1);
        INSERT INTO permissions (id, title, code, module_id, status) VALUES (16, 'View Interaction Stats', 'VIEW_INTERACTION_STATS', 1, 1);

    -- roles
        INSERT INTO roles (id, title) VALUES (1, 'Root');
        INSERT INTO roles (id, title) VALUES (2, 'Admin');
        INSERT INTO roles (id, title) VALUES (3, 'Provider');
        INSERT INTO roles (id, title) VALUES (4, 'Client');

    -- role_permission
        INSERT INTO role_permission (id, role_id, permission_id) VALUES (1, 1, 1);
        INSERT INTO role_permission (id, role_id, permission_id) VALUES (2, 1, 2);
        INSERT INTO role_permission (id, role_id, permission_id) VALUES (3, 2, 1);
        INSERT INTO role_permission (id, role_id, permission_id) VALUES (4, 2, 2);
        INSERT INTO role_permission (id, role_id, permission_id) VALUES (5, 2, 3);
        INSERT INTO role_permission (id, role_id, permission_id) VALUES (6, 3, 1);
        INSERT INTO role_permission (id, role_id, permission_id) VALUES (7, 3, 7);
        INSERT INTO role_permission (id, role_id, permission_id) VALUES (8, 4, 1);
        INSERT INTO role_permission (id, role_id, permission_id) VALUES (9, 4, 16);

    -- packs
        INSERT INTO packs (id, title, price, description, status) VALUES (1, 'Basic', 49.990000, 'Basic pack', 1);
        INSERT INTO packs (id, title, price, description, status) VALUES (2, 'Pro', 149.990000, 'Pro pack', 1);
        INSERT INTO packs (id, title, price, description, status) VALUES (3, 'Enterprise', 499.990000, 'Enterprise pack', 1);
        
    -- pack_lines
        INSERT INTO pack_lines (id, pack_id, module_id, price_ht, tva_value, price_ttc, discount) VALUES (1, 1, 1, 93.247801, 17.717082, 110.964883, 0.000000);
        INSERT INTO pack_lines (id, pack_id, module_id, price_ht, tva_value, price_ttc, discount) VALUES (2, 1, 2, 93.390782, 17.744249, 111.135031, 0.000000);
        INSERT INTO pack_lines (id, pack_id, module_id, price_ht, tva_value, price_ttc, discount) VALUES (3, 2, 1, 136.014259, 25.842709, 161.856968, 0.000000);
        INSERT INTO pack_lines (id, pack_id, module_id, price_ht, tva_value, price_ttc, discount) VALUES (4, 2, 2, 170.739241, 32.440456, 203.179697, 0.000000);
        INSERT INTO pack_lines (id, pack_id, module_id, price_ht, tva_value, price_ttc, discount) VALUES (5, 3, 1, 99.028650, 18.815444, 117.844094, 0.000000);
        INSERT INTO pack_lines (id, pack_id, module_id, price_ht, tva_value, price_ttc, discount) VALUES (6, 3, 2, 37.851110, 7.191711, 45.042821, 0.000000);

    -- companies
        INSERT INTO companies (id, admin_id, title, url, logo, matricule, domain, date_foundation, description, contact, status) VALUES (1, NULL, 'OSS Event', 'https://oss-events-backend.vercel.app', '/images/logos/ossEvent.png', 'ACME-001', 'events', '2010-05-12', 'Top event equipment providers', 'Have questions about our services? Want to discuss your upcoming event? Our team is here to help you create unforgettable moments.', 1);

    -- subscriptions
        INSERT INTO subscriptions (id, pack_id, start_date, end_date, company_id, status) VALUES (1, 1, now() - interval '0 days', now() + interval '30 days', 1, 1);

    -- users
        INSERT INTO users (id, firstname, lastname, username, email, password, role_id, company_id, email_verified, avatar) VALUES (1, 'Cpt', 'Root', 'CptRoot', 'a.boukadida@gst.com.tn', crypt('Ahmed123*', gen_salt('bf')), 1, null, true, '/images/users/admin.png');
        INSERT INTO users (id, firstname, lastname, username, email, password, role_id, company_id, email_verified, avatar) VALUES (2, 'Cpt', 'Admin', 'CptAdmin', 'admin1@ossevents.com', crypt('Admin1Pass!', gen_salt('bf')), 2, 1, true, '/images/default.jpg');
        INSERT INTO users (id, firstname, lastname, username, email, password, role_id, company_id, email_verified, avatar) VALUES (3, 'Cpt', 'Provider', 'CptProvider', 'ahmedboukadida.axia@gmail.com', crypt('ahmedboukadida.axia@gmail.com', gen_salt('bf')), 3, 1, true, '/images/default.jpg');
        INSERT INTO users (id, firstname, lastname, username, email, password, role_id, company_id, email_verified, avatar) VALUES (4, 'Cpt', 'Client', 'CptClient', 'gstcpt2023@gmail.com', crypt('gstcpt2023@gmail.com', gen_salt('bf')), 4, 1, true, '/images/default.jpg');

    -- link companies to admin users
        UPDATE companies SET admin_id = 2 WHERE id = 1;

    -- categories
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (13, 'Lieux', null, '/images/categories/1766673707323-Lieux-1766673707351.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (14, 'Catering', null, '/images/categories/1766673760546-Catering-1766673760557.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (15, 'Coiffure & Maquillage', null, '/images/categories/1766673771842-Coiffure---Maquillage-1766673771855.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (16, 'Décoration & Location', null, '/images/categories/1766673782338-D-coration---Location-1766673782348.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (17, 'Musique & Animation', null, '/images/categories/1766673791442-Musique---Animation-1766673791452.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (18, 'Photographie & Vidéo', null, '/images/categories/1766673798634-Photographie---Vid-o-1766673798647.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (19, 'Services Complémentaires', null, '/images/categories/1766673807282-Services-Compl-mentaires-1766673807292.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (20, 'Transport', null, '/images/categories/1766673815202-Transport-1766673815213.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (21, 'Vêtements & Accessoires', null, '/images/categories/1766673822266-V-tements---Accessoires-1766673822277.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (22, 'For Her', 15, '/images/categories/1766673862907-For-Her-1766673862916.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (23, 'Traiteur', 14, '/images/categories/1766673933980-Traiteur-1766673933990.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (24, 'Véhicule', 20, '/images/categories/1766673959386-V-hicule-1766673959396.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (25, 'For Him', 15, '/images/categories/1766673981762-For-Him-1766673981770.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (26, 'For Him', 21, '/images/categories/1766674030322-For-Him-1766674030367.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (27, 'Transport Traditionnel', 20, '/images/categories/1766674089202-Transport-Traditionnel-1766674089212.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (28, 'Gâteaux', 14, '/images/categories/1766674236914-G-teaux-1766674236925.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (29, 'Sweets & Desserts', 14, '/images/categories/1766674246530-Sweets---Desserts-1766674246537.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (30, 'Décoration Florale & Fleuriste', 16, '/images/categories/1766674269418-D-coration-Florale---Fleuriste-1766674269428.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (31, 'Spa & Hammam', 15, '/images/categories/1766674281850-Spa---Hammam-1766674281864.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (32, 'Boissons', 14, '/images/categories/1766674300482-Boissons-1766674300490.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (33, 'Kiosks', 14, '/images/categories/1766674310947-Kiosks-1766674310956.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (34, 'Cadeaux pour invités', 14, '/images/categories/1766674320706-Cadeaux-pour-invit-s-1766674320715.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (35, 'Robe de Soirée', 21, '/images/categories/1766674346650-Robe-de-Soir-e-1766674346714.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (36, 'For Kids', 21, '/images/categories/1766674356066-For-Kids-1766674356076.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (37, 'Accessoires', 21, '/images/categories/1766674365746-Accessoires-1766674365756.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (38, 'Robe Fiançailles & Mariage', 21, '/images/categories/1766674373690-Robe-Fian-ailles---Mariage-1766674373699.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (39, 'Robe Traditionnelle', 21, '/images/categories/1766674383074-Robe-Traditionnelle-1766674383083.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (40, 'Couture', 21, '/images/categories/1766674392883-Couture-1766674392891.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (41, 'For Her', 21, '/images/categories/1766674619083-For-Her-1766674619094.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (42, 'Décoration événementielle', 16, '/images/categories/1766674647467-D-coration--v-nementielle-1766674647476.jpg', 1, 1);
        INSERT INTO categories (id, title, head_category_id, image, company_id, status) VALUES (43, 'Équipement & Matériels', 16, '/images/categories/1766674684850--quipement---Mat-riels-1766674684859.jpg', 1, 1);

    -- provider_info
        INSERT INTO provider_info (id, user_id, category_id, type_provider, ste_title, logo, tarification, email, phone_number, whatsapp, fix_phone, fax, country, city, postal_code, street, department, map_location, website, facebook, instagram, tiktok, youtube, experience, foudation_date, about, policy, payment_en_especes, payment_virement, payment_par_cheque) VALUES (1, 6, 13, 1, 'Sghaier Events', '', 'Contacter le prestataire pour les tarifs', 'Sghaier@salledefaite.com', 0021690003004, 0021690003004, 0021670123456, 0021670123456, 'Tunisia', 'Sousse', '4040', 'Rond Point Akoud Kantaoui', 'department x', 'https://maps.app.goo.gl/i9surofvUJC3YLyF7', null, 'https://www.facebook.com/people/Salles-des-f%C3%AAtes-Sghaier/100039304587213/', null, null, null, '5', '2026-01-01', null, null, 1, 1, 1);
    
    -- countries
        INSERT INTO countries (id, name) VALUES (1, 'Tunisia');

    -- governorates
        INSERT INTO governorates (id, name, country_id) VALUES (1, 'Ariana', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (2, 'Béja', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (3, 'Ben Arous', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (4, 'Bizerte', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (5, 'Gabès', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (6, 'Gafsa', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (7, 'Jendouba', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (8, 'Kairouan', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (9, 'Kasserine', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (10, 'Kebili', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (11, 'Kef', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (12, 'Mahdia', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (13, 'Manouba', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (14, 'Mednine', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (15, 'Monastir', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (16, 'Nabeul', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (17, 'Sfax', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (18, 'Sidi Bouzid', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (19, 'Siliana', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (20, 'Sousse', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (21, 'Tataouine', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (22, 'Tozeur', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (23, 'Tunis', 1);
        INSERT INTO governorates (id, name, country_id) VALUES (24, 'Zaghouan', 1);

    -- municipalities
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ariana', '1211', 1);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ettadhamen-Mnihla', '1216', 1);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kalâat el-Andalous', '1214', 1);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('La Soukra', '1212', 1);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Raoued', '1213', 1);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Thabet', '1215', 1);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Béja', '2111', 2);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Maâgoula', '2112', 2);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Goubellat', '2117', 2);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Majaz al Bab', '2118', 2);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Nefza', '2114', 2);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Téboursouk', '2115', 2);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Testour', '2116', 2);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Zahret Medien', '2113', 2);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ben Arous', '1311', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bou Mhel el-Bassatine', '1315', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Mourouj', '1312', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ezzahra', '1316', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Hammam Chott', '1314', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Hammam Lif', '1313', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Khalidia', '1321', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mégrine', '1318', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mohamedia-Fouchana', '1319', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mornag', '1320', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Radès', '1317', 3);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Aousja', '1717', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bizerte', '1711', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Alia', '1720', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ghar al Milh', '1716', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mateur', '1713', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Abderrahmane', '1719', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Bourguiba', '1714', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Jemil', '1718', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Metline', '1722', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Raf Raf', '1723', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ras Jebel', '1721', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sejnane', '1712', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Tinja', '1715', 4);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bouchemma', '5124', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Chenini Nahal', '5112', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Dkhilet Toujane', '5125', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Hamma', '5116', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Gabès', '5111', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ghannouch', '5113', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Habib Thameur Bouatouch', '5122', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kettana', '5123', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mareth', '5119', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Matmata', '5117', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel El Habib', '5126', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Métouia', '5114', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Nouvelle Matmata', '5118', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Oudhref', '5115', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Teboulbou', '5121', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Zarat', '5120', 5);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Guettar', '6117', 6);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Ksar', '6112', 6);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Gafsa', '6111', 6);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mdhila', '6116', 6);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Métlaoui', '6115', 6);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Moularès', '6113', 6);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Redeyef', '6114', 6);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sened', '6118', 6);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Aïn Draham', '2214', 7);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Beni M''Tir', '2216', 7);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bou Salem', '2212', 7);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Fernana', '2215', 7);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ghardimaou', '2217', 7);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Jendouba', '2211', 7);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Oued Melliz', '2218', 7);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Tabarka', '2213', 7);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Aïn Djeloula', '4115', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Alaâ', '4117', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bou Hajla', '4122', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Chebika', '4112', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Echrarda', '4121', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Haffouz', '4116', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Hajeb El Ayoun', '4118', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kairouan', '4111', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Mehiri', '4120', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Nasrallah', '4119', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Oueslatia', '4114', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sbikha', '4113', 8);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Fériana', '4218', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Foussana', '4217', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Haïdra', '4216', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Jedelienne', '4214', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kasserine', '4211', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Magel Bel Abbès', '4220', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sbeitla', '4212', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sbiba', '4213', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Thala', '4215', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Thélepte', '4219', 9);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Djemna', '6312', 10);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Douz', '6313', 10);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Golâa', '6314', 10);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kebili', '6311', 10);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Souk Lahad', '6315', 10);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Dahmani', '2321', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Kef', '2311', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Ksour', '2320', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Jérissa', '2319', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kalaat es Senam', '2317', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kalâat Khasba', '2318', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Salem', '2316', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Nebeur', '2312', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sakiet Sidi Youssef', '2314', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sers', '2322', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Tajerouine', '2315', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Touiref', '2313', 11);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bou Merdes', '3313', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Chebba', '3320', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Chorbane', '3315', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Bradâa', '3324', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Djem', '3318', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Essouassi', '3317', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Hebira', '3316', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kerker', '3319', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ksour Essef', '3323', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mahdia', '3311', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Melloulèche', '3321', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ouled Chamekh', '3314', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Rejiche', '3312', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Alouane', '3322', 12);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Borj El Amri', '1416', 13);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Den Den', '1412', 13);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Djedeida', '1417', 13);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Douar Hicher', '1413', 13);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Battan', '1419', 13);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Manouba', '1411', 13);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mornaguia', '1415', 13);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Oued Ellil', '1414', 13);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Tebourba', '1418', 13);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ajim (Djerba)', '5217', 14);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ben Gardane', '5213', 14);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Beni Khedache', '5212', 14);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Houmt El Souk (Djerba)', '5215', 14);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Medenine', '5211', 14);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Midoun (Djerba)', '5216', 14);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Zarzis', '5214', 14);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Amiret El Fhoul', '3228', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Amiret El Hojjaj', '3230', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Amiret Touazra', '3229', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bekalta', '3232', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bembla-Mnara', '3222', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Benen Bodher', '3236', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Beni Hassen', '3217', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bouhjar', '3240', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Cherahil', '3231', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Masdour', '3224', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ghenada', '3218', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Jemmal', '3219', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Khniss', '3212', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ksar Hellal', '3234', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ksibet El Mediouni', '3235', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Lemta', '3239', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Ennour', '3223', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Farsi', '3227', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Hayet', '3241', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Kamel', '3220', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Moknine', '3225', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Monastir', '3211', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ouerdanin', '3213', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sahline Moôtmar', '3214', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sayada', '3238', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Ameur', '3215', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Bennour', '3226', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Téboulba', '3233', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Touza', '3237', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Zaouiet Kontoch', '3221', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Zéramdine', '3216', 15);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Azmour', '1522', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Béni Khalled', '1530', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Béni Khiar', '1513', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bou Argoub', '1533', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Dar Allouch', '1524', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Dar Chaabane', '1512', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Haouaria', '1525', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Maâmoura', '1514', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Mida', '1520', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Grombalia', '1532', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Hammam Ghezèze', '1523', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Hammamet', '1534', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kelibia', '1521', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Korba', '1516', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Korbous', '1528', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Bouzelfa', '1529', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Horr', '1519', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Temime', '1518', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Nabeul', '1511', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Soliman', '1527', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Somâa', '1515', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Takelsa', '1526', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Tazerka', '1517', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Zaouiet Djedidi', '1531', 16);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Agareb', '3418', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bir Ali Ben Khélifa', '3423', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Chihia', '3413', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Ain', '3416', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Hencha', '3420', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ghraïba, Tunisia', '3422', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Gremda', '3415', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Jebiniana', '3419', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kerkennah', '3426', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mahares', '3425', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Chaker', '3421', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sakiet Eddaïer', '3414', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sakiet Ezzit', '3412', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sfax', '3411', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Skhira', '3424', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Thyna', '3417', 17);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bir El Hafey', '4314', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Cebalet', '4313', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Jilma', '4312', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Meknassy', '4317', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Menzel Bouzaiane', '4316', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Mezzouna', '4318', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ouled Haffouz', '4320', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Regueb', '4319', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Ali Ben Aoun', '4315', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Bouzid', '4311', 18);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bargou', '2419', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bou Arada', '2412', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Aroussa', '2420', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Krib', '2414', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Gaâfour', '2413', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kesra', '2418', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Maktar', '2416', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Rouhia', '2417', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Bou Rouis', '2415', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Siliana', '2411', 19);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Akouda', '3116', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bouficha', '3121', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Enfidha', '3120', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ezzouhour', '3113', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Hammam Sousse', '3115', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Hergla', '3119', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kalâa Kebira', '3117', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kalâa Seghira', '3124', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Kondar', '3126', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ksibet Thrayet', '3112', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Messaadine', '3125', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('M''saken', '3123', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Bou Ali', '3118', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi El Hani', '3122', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sousse', '3111', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Zaouiet Sousse', '3114', 20);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bir Lahmar', '5312', 21);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Dehiba', '5314', 21);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Ghomrassen', '5313', 21);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Remada', '5315', 21);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Tataouine', '5311', 21);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Degache', '6212', 22);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Hamet Jerid', '6213', 22);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Nafta', '6214', 22);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Tamerza', '6215', 22);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Tozeur', '6211', 22);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Carthage', '1115', 23);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('La Goulette', '1114', 23);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('La Marsa', '1117', 23);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Le Bardo', '1112', 23);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Le Kram', '1113', 23);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Bou Said', '1116', 23);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Sidi Hassine', '1118', 23);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Tunis', '1111', 23);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Bir Mcherga', '1613', 24);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Djebel Oust', '1614', 24);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('El Fahs', '1615', 24);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Nadhour', '1616', 24);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Zaghouan', '1611', 24);
        INSERT INTO municipalities (name, code, governorate_id) VALUES ('Zriba', '1612', 24);

    -- clean the id counters
        DO $$
        DECLARE
            tbl_name TEXT;
            seq_name TEXT;
        BEGIN
            -- Loop through all tables in the 'public' schema
            FOR tbl_name IN
                SELECT tablename
                FROM pg_tables
                WHERE schemaname = 'public'
            LOOP
                -- Get the name of the sequence for the 'id' column
                seq_name := pg_get_serial_sequence('"' || tbl_name || '"', 'id');

                -- If a sequence exists for the 'id' column, reset it
                IF seq_name IS NOT NULL THEN
                    RAISE NOTICE 'Resetting sequence for table: %', tbl_name;
                    EXECUTE 'SELECT setval(''' || seq_name || ''', COALESCE((SELECT MAX(id) FROM "' || tbl_name || '"), 0) + 1, false)';
                END IF;
            END LOOP;
        END $$;

COMMIT;