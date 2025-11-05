import { supabase } from '../lib/supabase';

export const activityService = {
    async getRecentActivity(limit = 10) {
        try {
            const { data: activities, error } = await supabase
                .from('activity_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return activities || [];
        } catch (error) {
            throw new Error('Failed to fetch activity logs: ' + error.message);
        }
    }
};

export const settingsService = {
    async getSettings() {
        try {
            const { data: settings, error } = await supabase
                .from('settings')
                .select('*')
                .single();
            
            if (settings && !error) {
                return settings;
            }
            
            // Return default settings if none exist
            return {
                service_list: [
                    'Website development',
                    'SEO optimisation', 
                    'Domain registration',
                    'Hosting setup',
                    'UI/UX design',
                    'UI Design (Figma)',
                    'Video Editing',
                    'Digital Marketing',
                    'Social Media Handling',
                    'Landing page',
                    'Maintenance',
                    'Other'
                ],
                payment_modes: [
                    'UPI',
                    'Bank Transfer',
                    'PayPal',
                    'Stripe',
                    'Razorpay',
                    'Paytm',
                    'PhonePe',
                    'Google Pay',
                    'Apple Pay',
                    'Crypto (USDT)',
                    'Crypto (Bitcoin)',
                    'Crypto (Ethereum)', 
                    'Wire Transfer',
                    'Western Union',
                    'MoneyGram',
                    'Wise (formerly TransferWise)',
                    'Payoneer',
                    'Skrill',
                    'Neteller',
                    'MPesa',
                    'Bkash',
                    'Cash',
                    'Cheque',
                    'Other'
                ]
            };
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // Return default settings on error
            return {
                service_list: [
                    'Website development',
                    'SEO optimisation', 
                    'Domain registration',
                    'Hosting setup',
                    'UI/UX design',
                    'UI Design (Figma)',
                    'Video Editing',
                    'Digital Marketing',
                    'Social Media Handling',
                    'Landing page',
                    'Maintenance',
                    'Other'
                ],
                payment_modes: [
                    'UPI',
                    'Bank Transfer',
                    'PayPal',
                    'Stripe',
                    'Razorpay',
                    'Paytm',
                    'PhonePe',
                    'Google Pay',
                    'Apple Pay',
                    'Crypto (USDT)',
                    'Crypto (Bitcoin)',
                    'Crypto (Ethereum)', 
                    'Wire Transfer',
                    'Western Union',
                    'MoneyGram',
                    'Wise (formerly TransferWise)',
                    'Payoneer',
                    'Skrill',
                    'Neteller',
                    'MPesa',
                    'Bkash',
                    'Cash',
                    'Cheque',
                    'Other'
                ]
            };
        }
    },

    async updateSettings(settingsData) {
        try {
            const { data: existingSettings } = await supabase
                .from('settings')
                .select('*')
                .single();
            
            if (existingSettings) {
                const { data, error } = await supabase
                    .from('settings')
                    .update(settingsData)
                    .eq('id', existingSettings.id)
                    .select()
                    .single();
                
                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabase
                    .from('settings')
                    .insert(settingsData)
                    .select()
                    .single();
                
                if (error) throw error;
                return data;
            }
        } catch (error) {
            throw new Error('Failed to update settings: ' + error.message);
        }
    }
};