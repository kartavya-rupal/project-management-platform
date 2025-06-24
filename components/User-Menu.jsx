"use client";

import { UserButton } from "@clerk/nextjs";
import { ChartNoAxesGantt } from "lucide-react";

const UserMenu = () => {
    return (
        <UserButton
            appearance={{
                elements: {
                    avatarBox: {
                        width: 37,
                        height: 37,
                    },
                },
            }}
        >
            <UserButton.MenuItems>
                <UserButton.Link
                    label="My Organisations"
                    labelIcon={<ChartNoAxesGantt size={15} />}
                    href="/onboarding"
                />
                <UserButton.Action label="manageAccount" />
            </UserButton.MenuItems>
        </UserButton>
    );
};

export default UserMenu;