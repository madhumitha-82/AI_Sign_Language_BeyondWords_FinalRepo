package com.beyondwords.userservice.config;

import com.beyondwords.userservice.entity.User;
import com.beyondwords.userservice.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedAdmin("madhumithagopal82@gmail.com", "madhu@123", "Madhumitha G");
        seedAdmin("ssangamithra363@gmail.com", "Sangu@123", "Sangamithra S");
        seedAdmin("nivethanatarajan2711@gmail.com", "nive@123", "Nivetha N");
    }

    private void seedAdmin(String email, String rawPassword, String fullName) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isEmpty()) {
            User admin = new User();
            admin.setEmail(email);
            admin.setFullName(fullName);
            admin.setPasswordHash(passwordEncoder.encode(rawPassword));
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);
            System.out.println("Seeded admin user: " + email);
        } else {
            User admin = existing.get();
            // Ensure they have the admin role and update password if needed
            boolean updated = false;
            if (!"ROLE_ADMIN".equals(admin.getRole())) {
                admin.setRole("ROLE_ADMIN");
                updated = true;
            }
            if (!passwordEncoder.matches(rawPassword, admin.getPasswordHash())) {
                admin.setPasswordHash(passwordEncoder.encode(rawPassword));
                updated = true;
            }
            if (updated) {
                userRepository.save(admin);
                System.out.println("Updated admin user: " + email);
            }
        }
    }
}
